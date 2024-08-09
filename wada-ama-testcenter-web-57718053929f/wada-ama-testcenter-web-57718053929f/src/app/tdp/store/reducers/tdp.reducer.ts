import { Action, createReducer, on } from '@ngrx/store';
import * as fromTDPTableState from '@tdp/store/states/tdp-table.state';
import { DirtyCellInfo, ISportDisciplineId, TDPSheet, TDPSheetInfo } from '@tdp/models';
import * as fromTDPActions from '@tdp/store/actions/tdp.actions';

type ITDPTableState = fromTDPTableState.ITDPTableState;

export const tdpReducer = createReducer(
    fromTDPTableState.initialTDPTableState,
    on(fromTDPActions.SetTDPRequestedYear, (state, { year }) => ({
        ...state,
        requestedYear: year,
    })),
    on(fromTDPActions.GetTDPTable, (state) => ({
        ...state,
        loading: true,
        getError: false,
    })),
    on(fromTDPActions.GetTDPTableSuccess, (state, { sheet }) => {
        const { dirtyCells, tdpSheet } = mergeTDPSheetWithDirtyCells(sheet, state.dirtyCells);
        return {
            ...state,
            loading: false,
            getError: false,
            saveError: false,
            saving: false,
            dirtyCells,
            tdpSheet,
            highlightedSportDiscipline: fromTDPTableState.noSportDisciplineHighlighted,
        };
    }),
    on(fromTDPActions.GetTDPTablesError, (state) => ({
        ...state,
        loading: false,
        getError: true,
    })),
    on(fromTDPActions.InitialTDPSaving, (state) => ({
        ...state,
        saving: true,
    })),
    on(fromTDPActions.SaveTDPTable, fromTDPTableState.currentStateWithSaving),
    on(fromTDPActions.SaveTDPTableSuccess, (state, { sheet }) => {
        return currentStateWithDirtyCells(state, sheet);
    }),
    on(fromTDPActions.SaveTDPTablePolling, fromTDPTableState.currentStateWithSaving),
    on(fromTDPActions.SaveTDPTablePollingSuccess, (state, { sheet }) => {
        return currentStateWithDirtyCells(state, sheet);
    }),
    on(fromTDPActions.SaveTDPTableError, (state, { error }) => {
        const deleteException = checkErrorType(error);
        return {
            ...state,
            loading: false,
            saveError: !deleteException,
            saving: false,
            deleteException,
        };
    }),
    on(fromTDPActions.UpdateTDPTable, (state, { dirtyCell }) => {
        const { dirtyCells, tdpSheet } = updateCellInTDPSheet(state.tdpSheet, state.dirtyCells, dirtyCell);
        return { ...state, dirtyCells, tdpSheet };
    }),
    on(fromTDPActions.AddSportDisciplineSuccess, (state, { sportDiscipline }) => ({
        ...state,
        highlightedSportDiscipline: sportDiscipline,
    })),
    on(fromTDPActions.SetTDPTableQuarter, (state, { quarter }) => ({
        ...state,
        frequencyFilter: { ...state.frequencyFilter, quarter },
    })),
    on(fromTDPActions.SetTDPTableMonth, (state, { month }) => ({
        ...state,
        frequencyFilter: { ...state.frequencyFilter, month },
    })),
    on(fromTDPActions.SetTDPTableFrequency, (state, { frequency }) => ({
        ...state,
        frequencyFilter: { ...state.frequencyFilter, frequency },
    })),
    on(fromTDPActions.DeleteSportDiscipline, (state, { sportDiscipline }) => ({
        ...state,
        loading: false,
        saveError: false,
        saving: true,
        tdpSheet: partialDeleteDiscipline(sportDiscipline, state),
    })),
    on(fromTDPActions.AttemptSaveTDPTable, (state) => ({
        ...state,
        saving: isDirty(state),
        getError: false,
    }))
);

function currentStateWithDirtyCells(state: ITDPTableState, sheet: TDPSheet) {
    const { dirtyCells, tdpSheet } = mergeTDPSheetWithDirtyCells(sheet, state.dirtyCells);
    return {
        ...state,
        loading: false,
        saveError: false,
        saving: false,
        dirtyCells,
        tdpSheet,
        highlightedSportDiscipline: fromTDPTableState.noSportDisciplineHighlighted,
    };
}

export function reducer(state: ITDPTableState | undefined, action: Action): ITDPTableState {
    return tdpReducer(state, action);
}

interface TDPSheetWithDirtyCells {
    tdpSheet: TDPSheet;
    dirtyCells: Array<DirtyCellInfo>;
}

function mergeTDPSheetWithDirtyCells(tdpSheet: TDPSheet, dirtyCells: Array<DirtyCellInfo>): TDPSheetWithDirtyCells {
    // check the list of dirty cells
    // compare their dirtyValues to the values in the new TDPSheet
    // if equal, remove them from the list
    // otherwise, set dirty to true, keep them in the list and update their value to the tdpSheet value
    const updatedTDPSheet = tdpSheet.clone();
    const updatedDirtyCells: Array<DirtyCellInfo> = [];
    let valuesChanged = false;

    dirtyCells.forEach((dirtyCell) => {
        const tdpSheetCell = updatedTDPSheet.getCell(dirtyCell);
        if (tdpSheetCell && tdpSheetCell.cell.value !== dirtyCell.dirtyValue) {
            updatedDirtyCells.push({
                ...dirtyCell,
                savedValue: tdpSheetCell.cell.value,
            });
            tdpSheetCell.cell.value = dirtyCell.dirtyValue;
            tdpSheetCell.cell.isDirty = true;
            tdpSheetCell.subRow.isDirty = true;
            valuesChanged = true;
        }
    });

    if (valuesChanged) {
        updatedTDPSheet.updateOverlappingValues();
        updatedTDPSheet.updateTotals();
    }

    return { tdpSheet: updatedTDPSheet, dirtyCells: updatedDirtyCells };
}

function updateCellInTDPSheet(
    tdpSheet: TDPSheet,
    dirtyCells: Array<DirtyCellInfo>,
    dirtyCell: DirtyCellInfo
): TDPSheetWithDirtyCells {
    const updatedTDPSheet = tdpSheet.clone();
    let updatedDirtyCells = dirtyCells.map((cellToAdd) => ({ ...cellToAdd }));

    // Get the cell in the TDPSheet
    const tdpSheetCell = updatedTDPSheet.getCell(dirtyCell);
    if (!tdpSheetCell) {
        return { tdpSheet: updatedTDPSheet, dirtyCells: updatedDirtyCells };
    }

    // References to the TDPSheet cell and subrow
    const { cell, subRow } = tdpSheetCell;
    let savedValue = cell.value;

    // Update the dirty cells list
    const cellFoundIndex = dirtyCells.findIndex((c) => c.id === dirtyCell.id);
    if (cellFoundIndex < 0) {
        // Add a new dirty cell to the list
        savedValue = cell.value;
        updatedDirtyCells.push({ ...dirtyCell, savedValue });
    } else {
        savedValue = dirtyCells[cellFoundIndex].savedValue || 0;
        // Update or remove an existing dirty cell from the list
        if (dirtyCell.dirtyValue === savedValue) {
            updatedDirtyCells = dirtyCells.filter((c) => c.id !== dirtyCell.id);
        } else {
            updatedDirtyCells[cellFoundIndex] = {
                ...dirtyCells[cellFoundIndex],
                dirtyValue: dirtyCell.dirtyValue,
            };
        }
    }

    // Update the cell in the TDPSheet and recalculate the totals
    if (cell.value !== dirtyCell.dirtyValue) {
        cell.value = dirtyCell.dirtyValue;
        updatedTDPSheet.updateOverlappingValues();
        updatedTDPSheet.updateTotals();
    }

    cell.isDirty = cell.value !== savedValue;
    subRow.isDirty = updatedDirtyCells.some((c) => c.disciplineId === subRow.disciplineId);

    return { tdpSheet: updatedTDPSheet, dirtyCells: updatedDirtyCells };
}

function partialDeleteDiscipline(sportDiscipline: ISportDisciplineId, state: ITDPTableState): TDPSheet {
    const tdpSheet: TDPSheet = new TDPSheet(state.tdpSheet);

    tdpSheet.yearly.forEach((sheetInfo) => deleteDiscipline(sheetInfo, sportDiscipline));

    (tdpSheet.quarterly && tdpSheet.yearly && tdpSheet.monthly).forEach((sheetInfo) =>
        deleteDiscipline(sheetInfo, sportDiscipline)
    );

    tdpSheet.monthly.forEach((sheetInfo) => deleteDiscipline(sheetInfo, sportDiscipline));

    return tdpSheet;
}

function deleteDiscipline(sheetInfo: TDPSheetInfo, sportDiscipline: ISportDisciplineId) {
    const sport = sheetInfo.rows.find((tempSport) => tempSport.sportId === sportDiscipline.sportId);

    if (sport) {
        const discipline = sport.subRows.find((disc) => disc.disciplineId === sportDiscipline.disciplineId);
        if (discipline) {
            discipline.setIsDeleted(true);
        }
    }
}

function isDirty(state: ITDPTableState): boolean {
    return state.dirtyCells.length > 0;
}

function checkErrorType(error: number): boolean {
    return error === 404;
}

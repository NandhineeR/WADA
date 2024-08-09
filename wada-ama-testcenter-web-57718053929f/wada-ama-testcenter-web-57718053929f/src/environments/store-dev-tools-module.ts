import { StoreDevtoolsModule } from '@ngrx/store-devtools';

export const storeDevToolsModule = [
    StoreDevtoolsModule.instrument({
        name: 'Testcenter Web Store',
        maxAge: 25,
    }),
];

import { UserRolesEnum } from '@shared/models';

/**
 * Checks if the role is contained in the list of riole the user has access.
 * The fallback role is used in some specific cases:
 * **************************************************
 * Example 1: I want to know if the user has the read right(the read rigth doesnt exist and is provided by the write right)
 * The main role doesnt exist(we pass undefined) but if the user has the right write than he has the read right
 * userHasRole(roles, undefined, UserRolesEnum.WRITE)
 * **************************************************
 * Example 2: I want to know if the user has the write right
 * There is no fallbackRole that would give the write right implicitly
 * userHasRole(roles, UserRolesEnum.WRITE, undefined)
 * **************************************************
 * @param roles: The complete list of roles for the user
 * @param primaryRole: The main role, can be undefined
 * @param fallbackRoles: A collection of secondary roles to be used if the primary is lacking, can be undefined
 * @return Returns a boolean saying the user has the right or not
 */
export function userHasRole(
    roles: Array<string>,
    primaryRole: UserRolesEnum | undefined,
    fallbackRoles: Array<UserRolesEnum> | undefined
): boolean {
    let matchingPrimaryRole: number | undefined;
    let matchingFallbackRole: number | undefined;

    if (primaryRole) {
        matchingPrimaryRole = roles.findIndex((role: string) => role === primaryRole.toString());
        if (matchingPrimaryRole > -1) return true;
    }

    if (fallbackRoles) {
        // eslint-disable-next-line no-restricted-syntax
        for (const fallbackRole of fallbackRoles) {
            matchingFallbackRole = roles.findIndex((role: string) => role === fallbackRole.toString());
            if (matchingFallbackRole > -1) return true;
        }
    }

    return false;
}

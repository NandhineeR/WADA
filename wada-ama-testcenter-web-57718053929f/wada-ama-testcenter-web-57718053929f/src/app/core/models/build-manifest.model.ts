export interface IBuildManifest {
    project: IBuildManifestProject | undefined;
    build: IBuildManifestBuild | undefined;
    git: IBuildManifestGit | undefined;
}

export interface IBuildManifestProject {
    name: string | undefined;
    version: string | undefined;
}

export interface IBuildManifestBuild {
    number: number | undefined;
    version: string | undefined;
}

export interface IBuildManifestGit {
    project: string | undefined;
    repo: string | undefined;
    commit: string | undefined;
}
export class BuildManifest implements IBuildManifest {
    project: IBuildManifestProject | undefined;

    build: IBuildManifestBuild | undefined;

    git: IBuildManifestGit | undefined;

    constructor(buildManifest?: IBuildManifest | undefined) {
        this.project = buildManifest?.project;
        this.build = buildManifest?.build;
        this.git = buildManifest?.git;
    }
}

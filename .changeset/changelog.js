import defaultChangelogFunctions from "@changesets/changelog-github";

const MAINTAINER = "castastrophe";
const soloMaintainerThanks = new RegExp(
  String.raw` Thanks \[@${MAINTAINER}\]\(https:\/\/[^)]+\/${MAINTAINER}\)!`,
);

export default {
  getDependencyReleaseLine: defaultChangelogFunctions.getDependencyReleaseLine,
  async getReleaseLine(changeset, type, options) {
    const line = await defaultChangelogFunctions.getReleaseLine(
      changeset,
      type,
      options,
    );
    return line.replace(soloMaintainerThanks, "");
  },
};

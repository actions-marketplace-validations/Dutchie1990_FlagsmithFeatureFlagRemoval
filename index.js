const core = require("@actions/core");
const getGithubConfigFlags = require("./github");
const flagsmithAPI = require("./flagsmith");

// most @actions toolkit packages have async methods
async function run() {
  try {
    const flagsReadyToArchive = [];
    const flagsmithUrl = core.getInput("flagsmithUrl");
    const flagsmithToken = core.getInput("apitokenflagsmith");
    const owner = core.getInput("owner");
    const repo = core.getInput("repo");
    const path = core.getInput("path");
    const githubAuth = core.getInput("access_token");

    core.info(`values: ${flagsReadyToArchive}  ...`);
    core.info(`values: ${flagsmithUrl}  ...`);
    core.info(`values: ${flagsmithToken}  ...`);
    core.info(`values: ${owner}  ...`);
    core.info(`values: ${repo}  ...`);
    core.info(`values: ${path}  ...`);
    core.info(`values: ${githubAuth}  ...`);

    const githubFlags = await getGithubConfigFlags(
      githubAuth,
      owner,
      repo,
      path
    );

    core.info(`Flags defined in the Sales CRM: ${githubFlags}`);

    const flagsmithFlags = await flagsmithAPI.getFlagsmithFlags(
      flagsmithUrl,
      flagsmithToken
    );

    for (const key in flagsmithFlags) {
      if (Object.hasOwnProperty.call(flagsmithFlags, key)) {
        const element = flagsmithFlags[key];
        flagsReadyToArchive.push(element);
      }
    }

    core.info(`Flags defined in flagssmith: ${flagsmithFlags}`);
    core.info(`Flags ready to archive: ${flagsReadyToArchive}`);

    const archivedFlags = await flagsmithAPI.getArchivedFlags(
      flagsmithUrl,
      flagsmithToken
    );
    const flagsForDeletion = [];
    var date = new Date();
    date.setMonth(date.getMonth() - 2);

    for (const key in archivedFlags) {
      if (Object.hasOwnProperty.call(archivedFlags, key)) {
        const element = archivedFlags[key];
        if (element.created_date < date.toISOString()) {
          flagsForDeletion.push(element);
        }
      }
    }

    core.info(`Flags ready to delete: ${flagsForDeletion}`);
    core.info("Done");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

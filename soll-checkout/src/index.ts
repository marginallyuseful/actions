import * as core from "@actions/core";
import * as github from "@actions/github";

/**
 * Pre-checkout planner for soll.
 *
 * Runs *before* actions/checkout to determine the exact fetch-depth needed,
 * avoiding a separate deepen round-trip after checkout. Outputs:
 *
 * - `fetch-depth` — pass to actions/checkout
 * - `base-sha`    — the PR base or parent SHA
 * - `behind`      — how many commits the base is behind the merge base
 */
async function run(): Promise<void> {
  try {
    const token = core.getInput("token", { required: true });

    const isPr = github.context.eventName === "pull_request";

    if (isPr) {
      const baseSha = github.context.payload.pull_request?.base?.sha;
      if (!baseSha) {
        throw new Error("pull_request event missing base.sha");
      }

      const headSha = github.context.sha;
      const octokit = github.getOctokit(token);
      const { owner, repo } = github.context.repo;
      const { data } = await octokit.rest.repos.compareCommitsWithBasehead({
        owner,
        repo,
        basehead: `${baseSha}...${headSha}`,
      });

      const ahead = data.ahead_by;
      const behind = data.behind_by;
      core.info(`Compare: HEAD is ${ahead} ahead, ${behind} behind merge base`);

      core.setOutput("fetch-depth", String(ahead + 1));
      core.setOutput("base-sha", baseSha);
      core.setOutput("behind", String(behind));
    } else {
      // Push to main/default branch: depth 2 gives us HEAD + parent.
      core.setOutput("fetch-depth", "2");
      core.setOutput("base-sha", "");
      core.setOutput("behind", "0");
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();

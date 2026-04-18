import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as github from "@actions/github";

/** Run a git command and return stdout, trimmed. */
async function git(...args: string[]): Promise<string> {
  let stdout = "";
  await exec.exec("git", args, {
    listeners: { stdout: (data) => (stdout += data.toString()) },
    silent: true,
  });
  return stdout.trim();
}

/** Use the GitHub compare API to get the ahead/behind counts from the merge base. */
async function getCompareDistances(
  token: string,
  base: string,
  head: string,
): Promise<{ ahead: number; behind: number }> {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;
  const { data } = await octokit.rest.repos.compareCommitsWithBasehead({
    owner,
    repo,
    basehead: `${base}...${head}`,
  });
  return { ahead: data.ahead_by, behind: data.behind_by };
}

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
      const { ahead, behind } = await getCompareDistances(token, baseSha, headSha);
      core.info(`Compare: HEAD is ${ahead} ahead, ${behind} behind merge base`);

      // Deepen HEAD's history to reach the merge base
      if (ahead > 0) {
        await exec.exec("git", ["fetch", `--deepen=${ahead}`, "origin"]);
      }

      // Fetch base ref with enough depth to also reach the merge base
      await exec.exec("git", [
        "fetch",
        `--depth=${behind + 1}`,
        "origin",
        baseSha,
      ]);

      core.setOutput("base-ref", baseSha);
    } else {
      // Push to main/default branch: deepen by 1 to get the parent commit.
      await exec.exec("git", ["fetch", "--deepen=1", "origin"]);
      const parentSha = await git("rev-parse", "HEAD~1");
      core.setOutput("base-ref", parentSha);
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();

type ToolUsed = {
  kind: string;
  input: unknown;
  output?: unknown;
  error?: string;
};
class ToolsUsed {
  #toolsUsed: ToolUsed[] = [];

  public register = (tool: ToolUsed) => {
    this.#toolsUsed.push(tool);
  };

  public toJson = () => {
    return this.#toolsUsed;
  };
}

export { ToolsUsed, ToolUsed };

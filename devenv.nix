{ pkgs, ... }:

{
  languages.javascript = {
    enable = true;
    npm.enable = true;
    package = pkgs.nodejs_20;
  };

  devcontainer.enable = true;
  devcontainer.tweaks = [ "podman" "vscode" "gpg-agent" ];
  devcontainer.networkMode = "host";
  devcontainer.settings.customizations.vscode.extensions = [
    "mkhl.direnv"
    "bbenoist.Nix"
    "vscodevim.vim"
  ];
}

{ pkgs, ... }:
let
  shell = { pkgs, ... }: {
    languages.javascript = {
      enable = true;
      npm.enable = true;
      package = pkgs.nodejs_20;
    };
  };
in
{
  profiles.shell.module = {
    imports = [ shell ];
  };

  profiles.devcontainer.module = {
    devcontainer.enable = true;
  };
}
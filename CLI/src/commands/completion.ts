// SpecTree CLI - Shell Completion Command (F3.1.4)

import { Command } from 'commander';

/**
 * Generates a Bash completion script for the spectree CLI.
 */
function generateBashCompletion(): string {
  return `# Bash completion for spectree
# Add to ~/.bashrc or ~/.bash_profile:
#   eval "$(spectree completion bash)"

_spectree_completions() {
  local cur prev commands spec_subcommands completion_shells
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"

  commands="init spec export sync watch completion"
  spec_subcommands="list get create update delete"
  completion_shells="bash zsh fish"

  case "\${prev}" in
    spectree)
      COMPREPLY=( $(compgen -W "\${commands}" -- "\${cur}") )
      return 0
      ;;
    spec)
      COMPREPLY=( $(compgen -W "\${spec_subcommands}" -- "\${cur}") )
      return 0
      ;;
    completion)
      COMPREPLY=( $(compgen -W "\${completion_shells}" -- "\${cur}") )
      return 0
      ;;
    --format)
      COMPREPLY=( $(compgen -W "json yaml markdown csv" -- "\${cur}") )
      return 0
      ;;
    --type)
      COMPREPLY=( $(compgen -W "epic feature user-story task" -- "\${cur}") )
      return 0
      ;;
    --direction)
      COMPREPLY=( $(compgen -W "push pull both" -- "\${cur}") )
      return 0
      ;;
  esac

  if [[ "\${cur}" == -* ]]; then
    local opts="--help --version"
    COMPREPLY=( $(compgen -W "\${opts}" -- "\${cur}") )
    return 0
  fi
}

complete -F _spectree_completions spectree`;
}

/**
 * Generates a Zsh completion script for the spectree CLI.
 */
function generateZshCompletion(): string {
  return `#compdef spectree
# Zsh completion for spectree
# Add to ~/.zshrc:
#   eval "$(spectree completion zsh)"

_spectree() {
  local -a commands spec_subcommands formats types directions shells

  commands=(
    'init:Initialize a new SpecTree project'
    'spec:Manage specifications'
    'export:Export specifications'
    'sync:Sync specifications with remote'
    'watch:Watch for specification changes'
    'completion:Generate shell completion scripts'
  )

  spec_subcommands=(
    'list:List all specifications'
    'get:Get a single specification by ID'
    'create:Create a new specification'
    'update:Update an existing specification'
    'delete:Delete a specification'
  )

  formats=(json yaml markdown csv)
  types=(epic feature user-story task)
  directions=(push pull both)
  shells=(bash zsh fish)

  _arguments -C \\
    '1:command:->command' \\
    '*::arg:->args'

  case "$state" in
    command)
      _describe -t commands 'spectree commands' commands
      ;;
    args)
      case "\${words[1]}" in
        spec)
          _arguments -C \\
            '1:subcommand:->subcommand' \\
            '*::arg:->spec_args'
          case "$state" in
            subcommand)
              _describe -t spec_subcommands 'spec subcommands' spec_subcommands
              ;;
          esac
          ;;
        export)
          _arguments \\
            '--format[Output format]:format:(json yaml markdown csv)' \\
            '-o[Output file path]:file:_files' \\
            '--output[Output file path]:file:_files' \\
            '--type[Filter by type]:type:(epic feature user-story task)' \\
            '--include-metadata[Include metadata fields]' \\
            '--pretty[Pretty-print output]'
          ;;
        sync)
          _arguments \\
            '--direction[Sync direction]:direction:(push pull both)' \\
            '--dry-run[Preview changes without applying]' \\
            '--force[Force sync, overwriting conflicts]'
          ;;
        watch)
          _arguments \\
            '--dir[Directory to watch]:directory:_directories' \\
            '--debounce[Debounce interval in ms]:ms:'
          ;;
        completion)
          _arguments '1:shell:(bash zsh fish)'
          ;;
        init)
          _arguments \\
            '--name[Project name]:name:' \\
            '--format[Default output format]:format:(json yaml markdown csv)' \\
            '--api-url[API URL]:url:' \\
            '--api-key[API key]:key:'
          ;;
      esac
      ;;
  esac
}

_spectree "$@"`;
}

/**
 * Generates a Fish completion script for the spectree CLI.
 */
function generateFishCompletion(): string {
  return `# Fish completion for spectree
# Save to ~/.config/fish/completions/spectree.fish

# Disable file completions by default
complete -c spectree -f

# Top-level commands
complete -c spectree -n '__fish_use_subcommand' -a init -d 'Initialize a new SpecTree project'
complete -c spectree -n '__fish_use_subcommand' -a spec -d 'Manage specifications'
complete -c spectree -n '__fish_use_subcommand' -a export -d 'Export specifications'
complete -c spectree -n '__fish_use_subcommand' -a sync -d 'Sync specifications with remote'
complete -c spectree -n '__fish_use_subcommand' -a watch -d 'Watch for specification changes'
complete -c spectree -n '__fish_use_subcommand' -a completion -d 'Generate shell completion scripts'

# spec subcommands
complete -c spectree -n '__fish_seen_subcommand_from spec; and not __fish_seen_subcommand_from list get create update delete' -a list -d 'List all specifications'
complete -c spectree -n '__fish_seen_subcommand_from spec; and not __fish_seen_subcommand_from list get create update delete' -a get -d 'Get a specification by ID'
complete -c spectree -n '__fish_seen_subcommand_from spec; and not __fish_seen_subcommand_from list get create update delete' -a create -d 'Create a new specification'
complete -c spectree -n '__fish_seen_subcommand_from spec; and not __fish_seen_subcommand_from list get create update delete' -a update -d 'Update a specification'
complete -c spectree -n '__fish_seen_subcommand_from spec; and not __fish_seen_subcommand_from list get create update delete' -a delete -d 'Delete a specification'

# completion subcommands (shell types)
complete -c spectree -n '__fish_seen_subcommand_from completion' -a bash -d 'Generate Bash completions'
complete -c spectree -n '__fish_seen_subcommand_from completion' -a zsh -d 'Generate Zsh completions'
complete -c spectree -n '__fish_seen_subcommand_from completion' -a fish -d 'Generate Fish completions'

# init options
complete -c spectree -n '__fish_seen_subcommand_from init' -l name -d 'Project name'
complete -c spectree -n '__fish_seen_subcommand_from init' -l format -d 'Default output format' -a 'json yaml markdown csv'
complete -c spectree -n '__fish_seen_subcommand_from init' -l api-url -d 'API URL'
complete -c spectree -n '__fish_seen_subcommand_from init' -l api-key -d 'API key'

# export options
complete -c spectree -n '__fish_seen_subcommand_from export' -l format -d 'Output format' -a 'json yaml markdown csv'
complete -c spectree -n '__fish_seen_subcommand_from export' -s o -l output -d 'Output file path' -F
complete -c spectree -n '__fish_seen_subcommand_from export' -l type -d 'Filter by type' -a 'epic feature user-story task'
complete -c spectree -n '__fish_seen_subcommand_from export' -l include-metadata -d 'Include metadata fields'
complete -c spectree -n '__fish_seen_subcommand_from export' -l pretty -d 'Pretty-print output'

# sync options
complete -c spectree -n '__fish_seen_subcommand_from sync' -l direction -d 'Sync direction' -a 'push pull both'
complete -c spectree -n '__fish_seen_subcommand_from sync' -l dry-run -d 'Preview changes without applying'
complete -c spectree -n '__fish_seen_subcommand_from sync' -l force -d 'Force sync, overwriting conflicts'

# watch options
complete -c spectree -n '__fish_seen_subcommand_from watch' -l dir -d 'Directory to watch' -a '(__fish_complete_directories)'
complete -c spectree -n '__fish_seen_subcommand_from watch' -l debounce -d 'Debounce interval in ms'

# spec list options
complete -c spectree -n '__fish_seen_subcommand_from list' -l type -d 'Filter by type' -a 'epic feature user-story task'
complete -c spectree -n '__fish_seen_subcommand_from list' -l format -d 'Output format' -a 'json yaml markdown csv'
complete -c spectree -n '__fish_seen_subcommand_from list' -l page -d 'Page number'
complete -c spectree -n '__fish_seen_subcommand_from list' -l page-size -d 'Items per page'

# spec get options
complete -c spectree -n '__fish_seen_subcommand_from get' -l format -d 'Output format' -a 'json yaml markdown csv'

# spec create options
complete -c spectree -n '__fish_seen_subcommand_from create' -l title -d 'Specification title'
complete -c spectree -n '__fish_seen_subcommand_from create' -l type -d 'Specification type' -a 'epic feature user-story task'
complete -c spectree -n '__fish_seen_subcommand_from create' -l description -d 'Specification description'
complete -c spectree -n '__fish_seen_subcommand_from create' -l parent-id -d 'Parent specification ID'

# spec update options
complete -c spectree -n '__fish_seen_subcommand_from update' -l title -d 'New title'
complete -c spectree -n '__fish_seen_subcommand_from update' -l description -d 'New description'
complete -c spectree -n '__fish_seen_subcommand_from update' -l type -d 'New type' -a 'epic feature user-story task'

# spec delete options
complete -c spectree -n '__fish_seen_subcommand_from delete' -l force -d 'Skip confirmation prompt'`;
}

/**
 * Maps shell names to their completion generator functions.
 */
const completionGenerators: Record<string, () => string> = {
  bash: generateBashCompletion,
  zsh: generateZshCompletion,
  fish: generateFishCompletion,
};

/**
 * Creates and returns the `spectree completion` command with
 * subcommands for bash, zsh, and fish shells.
 */
export function createCompletionCommand(): Command {
  const cmd = new Command('completion')
    .description('Generate shell completion scripts');

  cmd
    .addCommand(
      new Command('bash')
        .description('Generate Bash completion script')
        .action(() => {
          console.log(completionGenerators.bash());
        })
    )
    .addCommand(
      new Command('zsh')
        .description('Generate Zsh completion script')
        .action(() => {
          console.log(completionGenerators.zsh());
        })
    )
    .addCommand(
      new Command('fish')
        .description('Generate Fish completion script')
        .action(() => {
          console.log(completionGenerators.fish());
        })
    );

  return cmd;
}

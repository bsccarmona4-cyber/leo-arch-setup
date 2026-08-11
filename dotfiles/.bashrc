#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

alias ls='ls --color=auto'
alias grep='grep --color=auto'
PS1='[\u@\h \W]\$ '
eval "$(starship init bash)"
fastfetch
alias reloj="tty-clock -c -C 7 -b"
export PATH="$HOME/.local/bin:$PATH"
eval $(thefuck --alias)
eval "$(starship init bash)"
alias ls='eza --icons --color=always --group-directories-first'
export GOOSE_MOIM_MESSAGE_FILE=$HOME/.caveman-prompt.md
export PATH=$HOME/.local/bin:$PATH

export PATH=$HOME/bin:$PATH

# 🔒 AUR seguro: corre aur-check antes de cualquier yay -S
yay() {
    local aur_pkgs=()
    local check=true

    for arg in "$@"; do
        case "$arg" in
            -S|--sync) check=true ;;
            -Syu|-Syu*) check=false ;;  # upgrades globales no checkean cada paquete
            -R|--remove|-Rs|-Rns) check=false ;;
            -Q*|--query*) check=false ;;
            --nocheck) check=false ;;
        esac
    done

    if $check; then
        for pkg in "$@"; do
            # Solo checkea si parece nombre de paquete (no flags)
            if [[ "$pkg" != -* ]] && [[ "$pkg" != "yay" ]]; then
                echo "🔒 aur-check: $pkg"
                /home/leo/bin/aur-check "$pkg"
                local rc=$?
                if [[ $rc -eq 2 ]]; then
                    echo "🛑 $pkg NO SEGURO. No se instalará."
                    return 2
                elif [[ $rc -eq 1 ]]; then
                    echo -n "⚠️ Continuar con $pkg? (s/N) "
                    read -r confirm
                    [[ "$confirm" != "s" && "$confirm" != "S" ]] && return 1
                fi
            fi
        done
    fi

    command yay "$@"
}

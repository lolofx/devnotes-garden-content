#!/usr/bin/env bash
# Installe (ou met à jour) les skills communautaires requis pour ce repo.
# Usage : bash .claude/install-skills.sh
# Ré-exécuter à tout moment pour mettre à jour.

set -e

# NE JAMAIS copier write-devnote ni critique-devnote dans ~/.claude/skills/ :
# ils sont portés par le repo et chargés automatiquement depuis .claude/skills/.
# Une copie globale finit toujours par diverger et par faire foi à tort.

echo "Installation des skills communautaires du devnotes-garden..."

npx skills add ccheney/robust-skills@clean-ddd-hexagonal -g -y
npx skills add melodic-software/claude-code-plugins@milan-jovanovic-blog -g -y

echo ""
echo "Skills communautaires installés. write-devnote et critique-devnote viennent du repo, rien à installer."

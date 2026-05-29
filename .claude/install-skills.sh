#!/usr/bin/env bash
# Installe (ou met à jour) les skills communautaires requis pour ce repo.
# Usage : bash .claude/install-skills.sh
# Ré-exécuter à tout moment pour mettre à jour.

set -e

echo "Installation des skills devnotes-garden..."

npx skills add ccheney/robust-skills@clean-ddd-hexagonal -g -y
npx skills add melodic-software/claude-code-plugins@milan-jovanovic-blog -g -y

echo ""
echo "Skills installés. Les skills embarqués dans .claude/skills/ sont déjà disponibles via le repo."

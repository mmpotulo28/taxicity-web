#!/bin/bash

# TaxiCity Docker Operations CLI
# Usage: ./scripts/deploy.sh

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper for building and pushing
build_and_push() {
    APP_NAME=$1
    FOLDER_PATH=$2
    TAG_NAME="mmpotulo28/taxyciti-$APP_NAME"

    echo -e "${BLUE}▶ Starting build for $APP_NAME...${NC}"

    # Check if we are running from root
    if [ ! -f "package.json" ]; then
        echo -e "${RED}Error: Please run this script from the project root.${NC}"
        return
    fi

    echo "  Target: $TAG_NAME:latest"
    echo "  Context: ."
    echo "  Dockerfile: $FOLDER_PATH/Dockerfile"

    docker build --platform linux/amd64 -f $FOLDER_PATH/Dockerfile -t $TAG_NAME:latest .

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✔ Build successful! Pushing to Docker Hub...${NC}"
        docker push $TAG_NAME:latest

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✔ Successfully pushed $TAG_NAME${NC}"
        else
            echo -e "${RED}✘ Push failed for $APP_NAME${NC}"
        fi
    else
        echo -e "${RED}✘ Build failed for $APP_NAME${NC}"
    fi
    echo ""
}

# Clear screen
clear
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   TaxiCity Docker Operations CLI      ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo "Current directory: $(pwd)"
echo ""

PS3='Select an action: '
options=("Build & Push USER App" "Build & Push DRIVER App" "Build & Push WEBSOCKET Server" "Build & Push ALL Apps" "Deploy locally (Docker Compose)" "Quit")

select opt in "${options[@]}"
do
    case $opt in
        "Build & Push USER App")
            build_and_push "user" "apps/user"
            ;;
        "Build & Push DRIVER App")
            build_and_push "driver" "apps/driver"
            ;;
        "Build & Push WEBSOCKET Server")
            build_and_push "websocket" "apps/websocket"
            ;;
        "Build & Push ALL Apps")
            build_and_push "user" "apps/user"
            build_and_push "driver" "apps/driver"
            build_and_push "websocket" "apps/websocket"
            echo -e "${GREEN}All builds completed.${NC}"
            ;;
        "Deploy locally (Docker Compose)")
            echo -e "${BLUE}▶ Pulling latest images...${NC}"
            docker compose pull
            echo -e "${BLUE}▶ Recreating containers...${NC}"
            docker compose up -d --force-recreate
            echo -e "${GREEN}✔ Local deployment updated.${NC}"
            ;;
        "Quit")
            echo "Exiting..."
            break
            ;;
        *) echo "Invalid option $REPLY";;
    esac
    echo -e "${BLUE}---------------------------------------${NC}"
    # Prompt again
    # REPLAY logic is handled by select loop automatically
done

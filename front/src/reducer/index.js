import Workspace from '../Components/Block/workspace';
import CANVASCONSTANTS from '../Components/Canvas/constants';
import Utils from '../utils/utils';
import workspaceList from '../Components/Block/workspaceList';
/* eslint-disable import/prefer-default-export */

export const workspaceReducer = (workspace, { type, blockParams, id }) => {
  let block = null;
  switch (type) {
    case 'ADD_BLOCK':
    { block = workspace.addBlock(id);
      workspace.addTopblock(block);
      block.makeFromJSON(blockParams);
      const nWorkspace = new Workspace(
        workspace.blockDB,
        workspace.topblocks,
        workspace.setRender,
        workspace.id,
        workspace.imageId,
      );
      workspaceList.workspaces.splice(
        workspaceList.getWorkspaceIdxById(workspace.id),
        1,
        nWorkspace,
      );
      return nWorkspace; }
    case 'DELETE_BLOCK':
    { workspace.deleteBlock(id);
      const nWorkspace = new Workspace(
        workspace.blockDB,
        workspace.topblocks,
        workspace.setRender,
        workspace.id,
        workspace.imageId,
      );
      workspaceList.workspaces.splice(
        workspaceList.getWorkspaceIdxById(workspace.id),
        1,
        nWorkspace,
      );
      return nWorkspace; }
    case 'SCROLL_END':
    { workspace.deleteBlockInModelList();
      const nWorkspace = new Workspace(
        workspace.blockDB,
        workspace.topblocks,
        workspace.setRender,
        workspace.id,
        workspace.imageId,
      );
      workspaceList.workspaces.splice(
        workspaceList.getWorkspaceIdxById(workspace.id),
        1,
        nWorkspace,
      );
      return nWorkspace; }
    case 'CHANGE_WORKSPACE':
    { let changedWorkspace;
      workspaceList.workspaces.forEach((ws) => {
        if (ws.imageId === id) {
          changedWorkspace = new Workspace(
            ws.blockDB,
            ws.topblocks,
            workspace.setRender,
            ws.id,
            ws.imageId,
          );
        }
      });
      return changedWorkspace; }
    case 'SELECTED_WORKSPACE_DELETED':
      return new Workspace(
        workspaceList.workspaces[id].blockDB,
        workspaceList.workspaces[id].topblocks,
        workspace.setRender,
        workspaceList.workspaces[id].id,
        workspaceList.workspaces[id].imageId,
      );
    default:
      throw new Error('NOT FOUND TYPE');
  }
};

export const spritesReducer = (sprites, { type, coordinate, key, value, images }) => {
  const changeSprites = { ...sprites };
  const position = sprites[key];
  let eventValue = null;
  let inputEl = '';
  switch (type) {
    case 'CHANGE_POSITION':
      eventValue = value.charCodeAt(value.length - 1);
      if (eventValue === 45) {
        position[coordinate] = '-';
        changeSprites[key] = position;
        return changeSprites;
      }
      if (eventValue < 48 || eventValue > 57) return sprites;

      if (value[0] === '0' && value.length > 1) {
        inputEl = value.slice(1, value.length);
      } else {
        inputEl = value;
      }
      if (coordinate === 'x') {
        inputEl = Utils.checkRange(
          inputEl,
          -CANVASCONSTANTS.CANVAS.WIDTH / 2,
          CANVASCONSTANTS.CANVAS.WIDTH / 2,
        );
      } else if (coordinate === 'y') {
        inputEl = Utils.checkRange(
          inputEl,
          -CANVASCONSTANTS.CANVAS.HEIGHT / 2,
          CANVASCONSTANTS.CANVAS.HEIGHT / 2,
        );
      }
      position[coordinate] = inputEl;
      changeSprites[key] = position;
      return changeSprites;
    case 'CHANGE_SIZE':
      eventValue = value.charCodeAt(value.length - 1);
      if (eventValue < 48 || eventValue > 57 || value.includes('-')) return sprites;
      position.size = value;
      changeSprites[key] = position;
      return changeSprites;
    case 'CHANGE_DIRECTION':
      eventValue = value.charCodeAt(value.length - 1);
      if (eventValue < 48 || eventValue > 57 || value.includes('-')) return sprites;
      position.direction = value % 360;
      changeSprites[key] = position;
      return changeSprites;
    case 'CHANGE_NAME':
      position.name = value;
      changeSprites[key] = position;
      return changeSprites;
    case 'DRAG_MOVE':
    case 'MOVE':
      position.x = Utils.checkRange(
        value.x,
        -CANVASCONSTANTS.CANVAS.WIDTH / 2,
        CANVASCONSTANTS.CANVAS.WIDTH / 2,
      );
      position.y = Utils.checkRange(
        value.y,
        -CANVASCONSTANTS.CANVAS.HEIGHT / 2,
        CANVASCONSTANTS.CANVAS.HEIGHT / 2,
      );
      changeSprites[key] = position;
      return changeSprites;
    case 'DRAG_END':
      position.x = Utils.checkRange(
        value.x,
        -CANVASCONSTANTS.CANVAS.WIDTH / 2 + 1,
        CANVASCONSTANTS.CANVAS.WIDTH / 2 - 1,
      );
      position.y = Utils.checkRange(
        value.y,
        -CANVASCONSTANTS.CANVAS.HEIGHT / 2 + 1,
        CANVASCONSTANTS.CANVAS.HEIGHT / 2 - 1,
      );
      return changeSprites;
    case 'ROTATE':
      position.direction = value.direction % 360;
      if (position.direction < 0) position.direction = 360 + position.direction;
      changeSprites[key] = position;
      return changeSprites;
    case 'BOUNCE':
      position.x = value.x;
      position.y = value.y;
      position.direction = value.direction;
      position.reversal = value.reversal;
      return changeSprites;
    case 'ADD_IMAGE':
      changeSprites[key] = value;
      workspaceList.images.push(key);
      workspaceList.workspaces.push(new Workspace(null, null, null, null, key));
      return changeSprites;
    case 'DELETE_IMAGE':
    { let { length } = workspaceList.workspaces;
      for (let i = 0; i < length; i += 1) {
        if (workspaceList.workspaces[i].imageId === key) {
          delete workspaceList.workspaces[i].dragging;
          delete workspaceList.workspaces[i].connectionDB;
          delete workspaceList.workspaces[i].blockDB;
          delete workspaceList.workspaces[i];
          workspaceList.workspaces.splice(i, 1);
          workspaceList.images.splice(i, 1);
          i -= 1;
          length -= 1;
        }
      }
      delete changeSprites[key];
      return changeSprites; }
    case 'LOAD_PROJECT':
      return images.reduce((prev, curr) => {
        // eslint-disable-next-line no-param-reassign
        prev[curr.id] = { ...curr, x: curr.positionX, y: curr.positionY };
        return prev;
      }, {});
    default:
      throw new Error('NOT FOUND TYPE');
  }
};

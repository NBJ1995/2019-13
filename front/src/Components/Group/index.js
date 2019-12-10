import React, { useState, useContext, useRef, useEffect } from 'react';
import PropType from 'prop-types';
import drag from '../Block/Logic/Drag';
import { WorkspaceContext } from '../../Context';
import CONSTANTS from '../Block/constants';
import Input from './input';

const Group = ({ block }) => {
  // eslint-disable-next-line
  let [isMoved, setMoved] = useState(true);
  const [position, setPosition] = useState({ x: block.x, y: block.y });
  if (block.previousElement && position.y !== block.previousElement.height - CONSTANTS.PIXEL) {
    setPosition({ x: 0, y: block.previousElement.height - CONSTANTS.PIXEL });
  }
  if (block.parentElement && position.y !== CONSTANTS.BLOCK_HEAD_HEIGHT) {
    setPosition({ x: CONSTANTS.PREVIOUS_NEXT_POS_X, y: CONSTANTS.BLOCK_HEAD_HEIGHT });
  }
  if (block.outputElement) {
    if ((block.outputElement.style === 'condition' || block.outputElement.style === 'variable') && position.y !== 0) {
      block.outputElement.inputElement.forEach((input, idx) => {
        if (block.outputElement.inputX[idx] && (input.id === block.id)) {
          setPosition({ x: block.outputElement.inputX[idx], y: 0 });
        }
      });
    } else if ((block.outputElement.style === 'single' || block.outputElement.style === 'double') && position.y !== CONSTANTS.PIXEL + 1) {
      block.outputElement.inputElement.forEach((input, idx) => {
        if (block.outputElement.inputX[idx] && (input.id === block.id)) {
          setPosition({ x: block.outputElement.inputX[idx], y: CONSTANTS.PIXEL + 1 });
        }
      });
    }
  }
  const { workspaceDispatch } = useContext(WorkspaceContext);
  const [, setRender] = useState();
  const gRef = useRef();
  let inputIdx = -1;
  useEffect(() => {
    // eslint-disable-next-line
    block.render = setRender;
    block.setNode(gRef.current);
  }, [block]);
  if (block.previousElement || block.parentElement || block.outputElement) isMoved = true;
  return (
    <g
      id={block.id}
      key={block.id}
      ref={gRef}
      onMouseLeave={isMoved ? () => {} : () => {
        workspaceDispatch({
          type: 'DELETE_BLOCK',
          id: block.id,
        });
      }}
      onMouseDown={
          drag({ set: setPosition, block, setMoved, workspaceDispatch })
      }
      transform={`translate(${position.x},${position.y})`}
    >
      {block.path}
      {block.args.reduce((acc, cur) => {
        if (cur !== 'input' && cur !== 'block') {
          acc.push(cur);
          return acc;
        }
        inputIdx += 1;
        if (cur === 'block') {
          const inputBlock = block.workspace.getBlockById(block.inputElement[inputIdx].id);
          acc.push(<Group block={inputBlock} key={block.inputElement[inputIdx].id} />);
          return acc;
        }
        acc.push(<Input block={block} index={inputIdx} key={inputIdx} />);
        return acc;
      }, [])}
      {block.firstchildElement
      && <Group block={block.firstchildElement} key={block.firstchildElement.id} />}
      {block.secondchildElement
      && <Group block={block.secondchildElement} key={block.secondchildElement.id} />}
      {block.nextElement && <Group block={block.nextElement} key={block.nextElement.id} />}
    </g>
  );
};

Group.propTypes = {
  block: PropType.object.isRequired,
};

export default Group;

import { useState, useEffect, useCallback } from 'react';

const MyFunctionalComponent = (props) => {
const [boardData, setBoardData] = useState([
  {
    name: 'To Do',
    items: ['Task 1', 'Task 2'],
  },
  {
    name: 'In Progress',
    items: ['Task 3'],
  },
  {
    name: 'Done',
    items: [],
  },
]);
const [draggedItem, setDraggedItem] = useState(null);

useEffect(() => {
  const handleMouseMove = (e) => {
    setDraggedItem({
      x: e.clientX,
      y: e.clientY,
    });
  };
  document.addEventListener('mousemove', handleMouseMove);
  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
  };
}, []);

const handleDragStart = (e, item, column) => {
  e.dataTransfer.setData(
    'text/plain',
    JSON.stringify({
      item,
      column,
    })
  );
  setDraggedItem({
    item,
    column,
  });
};

const handleDrop = (e, column) => {
  const data = JSON.parse(e.dataTransfer.getData('text/plain'));
  const newBoardData = [...boardData];
  newBoardData[data.column].items = newBoardData[data.column].items.filter(
    (i) => i !== data.item
  );
  newBoardData[column].items.push(data.item);
  setBoardData(newBoardData);
  setDraggedItem(null);
};

const handleDragOver = (e) => {
  e.preventDefault();
};

const renderBoard = () => {
  return boardData.map((column, i) => (
    <div
      key={i}
      className="column"
      onDrop={(e) => handleDrop(e, i)}
      onDragOver={handleDragOver}
    >
      <h2> {column.name} </h2>{' '}
      {column.items.map((item, j) => (
        <div
          key={j}
          className="item"
          draggable={true}
          onDragStart={(e) => handleDragStart(e, item, i)}
        >
          {' '}
          {item}{' '}
        </div>
      ))}{' '}
    </div>
  ));
};

return <div className="board">{renderBoard()}</div>;

export default MyFunctionalComponent;


// .item {
//     cursor: grab;
// }
// .item.dragging {
//     opacity: 0.5;
//     cursor: grabbing;
// }

// .column {
//     /* Add styling for the columns */
//     width: 25%; /* Set the width of the column to 25% of the container */
//     float: left; /* Float the columns left to create a row */
//     padding: 10px; /* Add padding for spacing */
//     box-sizing: border-box; /* Include padding and border in the total width and height of the element */
//     border: 1px solid black; /* Add a border */
// }




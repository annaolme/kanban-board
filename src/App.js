import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const defaultColumns = {
    todo: { title: 'To Do', items: [] },
    inProgress: { title: 'In Progress', items: [] },
    done: { title: 'Done', items: [] }
};

function App() {
    const [columns, setColumns] = useState(() => {
        const saved = localStorage.getItem('kanban');
        return saved ? JSON.parse(saved) : defaultColumns;
    });
    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        localStorage.setItem('kanban', JSON.stringify(columns));
    }, [columns]);

    const addTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        const task = { id: Date.now().toString(), text: newTask.trim(), createdAt: new Date().toISOString() };
        setColumns(prev => ({
            ...prev,
            todo: { ...prev.todo, items: [...prev.todo.items, task] }
        }));
        setNewTask('');
    };

    const deleteTask = (columnId, taskId) => {
        setColumns(prev => ({
            ...prev,
            [columnId]: {
                ...prev[columnId],
                items: prev[columnId].items.filter(item => item.id !== taskId)
            }
        }));
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const { source, destination } = result;

        if (source.droppableId === destination.droppableId) {
            const col = columns[source.droppableId];
            const items = [...col.items];
            const [moved] = items.splice(source.index, 1);
            items.splice(destination.index, 0, moved);
            setColumns(prev => ({ ...prev, [source.droppableId]: { ...col, items } }));
        } else {
            const sourceCol = columns[source.droppableId];
            const destCol = columns[destination.droppableId];
            const sourceItems = [...sourceCol.items];
            const destItems = [...destCol.items];
            const [moved] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, moved);
            setColumns(prev => ({
                ...prev,
                [source.droppableId]: { ...sourceCol, items: sourceItems },
                [destination.droppableId]: { ...destCol, items: destItems }
            }));
        }
    };

    return (
        <div className="app">
            <h1>Kanban Board</h1>
            <form className="add-form" onSubmit={addTask}>
                <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="New task..." />
                <button type="submit">Add</button>
            </form>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="board">
                    {Object.entries(columns).map(([colId, col]) => (
                        <div key={colId} className="column">
                            <h2>{col.title} <span className="count">{col.items.length}</span></h2>
                            <Droppable droppableId={colId}>
                                {(provided, snapshot) => (
                                    <div
                                        className={'task-list' + (snapshot.isDraggingOver ? ' dragging-over' : '')}
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {col.items.map((item, index) => (
                                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                                {(provided) => (
                                                    <div
                                                        className="task-card"
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <span>{item.text}</span>
                                                        <button className="del" onClick={() => deleteTask(colId, item.id)}>×</button>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
}

export default App;

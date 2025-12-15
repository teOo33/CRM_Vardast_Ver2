import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Edit, History, Wrench } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { checkSLA, formatDate } from '../utils/helpers';

const KanbanBoard = ({ items, onStatusChange, columns, navigateToProfile, openModal, type, setHistoryModalData }) => {
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    if (result.source.droppableId !== destination.droppableId) {
      onStatusChange(draggableId, destination.droppableId);
    }
  };
  const getItemsByStatus = (status) => items.filter(i => i.status === status);
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {Object.entries(columns).map(([statusId, statusLabel]) => (
          <Droppable key={statusId} droppableId={statusId}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl p-4 min-w-[280px] w-80 flex flex-col border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm">{statusLabel}</h3>
                  <span className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded-lg text-xs font-mono text-gray-500 dark:text-gray-300 border dark:border-slate-600">{getItemsByStatus(statusId).length}</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                  {getItemsByStatus(statusId).map((item, index) => {
                    const isSLA = checkSLA(item);
                    return (
                      <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`bg-white dark:bg-slate-700 p-3 rounded-xl shadow-sm border group hover:shadow-md transition relative ${isSLA ? 'border-red-400 animate-pulse-red' : 'border-white dark:border-slate-600'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateToProfile(item.username)}><UserAvatar name={item.username} size="sm" /><span className="font-bold text-xs text-gray-800 dark:text-white truncate max-w-[100px]">{item.username}</span></div>
                              <div className="flex items-center gap-1">
                                {item.history && item.history.length > 0 && setHistoryModalData && <button onClick={() => setHistoryModalData(item.history)} className="text-gray-400 hover:text-blue-500"><History size={14}/></button>}
                                <button onClick={() => openModal(type, item)} className="text-gray-400 hover:text-blue-500"><Edit size={14}/></button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">{item.desc_text || item.title || item.reason}</p>
                            <div className="flex justify-between items-center text-[10px] text-gray-400">
                              <div className="flex items-center gap-2">
                                  <span className="font-mono">{formatDate(item.created_at || item.frozen_at || item.requested_at)}</span>
                                  {item.created_by && <span className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400">{item.created_by}</span>}
                              </div>
                              <div className="flex items-center gap-1">
                                  {item.technical_review && <div className="bg-indigo-100 text-indigo-600 p-1 rounded" title="بررسی فنی"><Wrench size={12}/></div>}
                                  {item.flag && <span className={`px-1.5 py-0.5 rounded font-bold border ${item.flag === 'پیگیری فوری' ? 'bg-red-100 text-red-800 border-red-200 blink-slow' : item.flag === 'پیگیری مهم' ? 'bg-amber-100 text-amber-800 border-amber-200 blink-slow' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>{item.flag}</span>}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;

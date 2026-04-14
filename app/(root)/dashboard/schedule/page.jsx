"use client";
// pages/todo.jsx or app/todo/page.jsx
import React, { useState, useEffect } from "react";
import { Calendar, Clock, Edit2, Trash2, CheckCircle, Circle, Plus, Save, X } from "lucide-react";

const TodoPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [todos, setTodos] = useState({});
  const [taskText, setTaskText] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState("");
  const [showPastWarning, setShowPastWarning] = useState(false);

  // Load todos from localStorage on mount
  useEffect(() => {
    const storedTodos = localStorage.getItem("userTodos");
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("userTodos", JSON.stringify(todos));
  }, [todos]);

  const isPastDate = (date) => {
    const today = new Date().toISOString().split('T')[0];
    return date < today;
  };

  const isSelectedDatePast = isPastDate(selectedDate);

  const getDateTodos = () => {
    return todos[selectedDate] || [];
  };

  const addTask = () => {
    if (!taskText.trim()) return;
    
    if (isSelectedDatePast) {
      setShowPastWarning(true);
      setTimeout(() => setShowPastWarning(false), 3000);
      return;
    }

    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTodos(prev => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), newTask]
    }));
    setTaskText("");
  };

  const toggleTask = (taskId) => {
    if (isSelectedDatePast) {
      setShowPastWarning(true);
      setTimeout(() => setShowPastWarning(false), 3000);
      return;
    }

    setTodos(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate].map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const deleteTask = (taskId) => {
    if (isSelectedDatePast) {
      setShowPastWarning(true);
      setTimeout(() => setShowPastWarning(false), 3000);
      return;
    }

    setTodos(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate].filter(task => task.id !== taskId)
    }));
  };

  const startEdit = (task) => {
    if (isSelectedDatePast) {
      setShowPastWarning(true);
      setTimeout(() => setShowPastWarning(false), 3000);
      return;
    }
    setEditingTask(task.id);
    setEditText(task.text);
  };

  const saveEdit = (taskId) => {
    if (!editText.trim()) return;

    setTodos(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate].map(task =>
        task.id === taskId ? { ...task, text: editText } : task
      )
    }));
    setEditingTask(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditText("");
  };

  const deleteAllTasksForDate = () => {
    if (isSelectedDatePast) {
      setShowPastWarning(true);
      setTimeout(() => setShowPastWarning(false), 3000);
      return;
    }

    if (window.confirm("Delete all tasks for this date?")) {
      setTodos(prev => {
        const newTodos = { ...prev };
        delete newTodos[selectedDate];
        return newTodos;
      });
    }
  };

  const getDateStatus = (date) => {
    const dateTodos = todos[date] || [];
    const completedCount = dateTodos.filter(t => t.completed).length;
    const totalCount = dateTodos.length;
    
    if (totalCount === 0) return "No tasks";
    if (completedCount === totalCount) return "Completed";
    return `${completedCount}/${totalCount} done`;
  };

  const getDateButtonClass = (date) => {
    const dateTodos = todos[date] || [];
    const completedCount = dateTodos.filter(t => t.completed).length;
    const totalCount = dateTodos.length;
    
    if (totalCount === 0) return "bg-white border-gray-300 text-gray-700";
    if (completedCount === totalCount) return "bg-green-600 border-green-600 text-white";
    return "bg-blue-600 border-blue-600 text-white";
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = -7; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);
    }
    return dates;
  };

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dateStr === today.toISOString().split('T')[0]) return "Today";
    if (dateStr === tomorrow.toISOString().split('T')[0]) return "Tomorrow";
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const completedCount = getDateTodos().filter(t => t.completed).length;
  const totalCount = getDateTodos().length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Todo List</h1>
          <p className="text-gray-600 mt-2">Manage your tasks by date</p>
          <span className="text-xs text-orange-500">Disclamer: All data are stored in your local system.</span>
        </div>

        {/* Past Date Warning */}
        {showPastWarning && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">⚠️ Cannot modify past dates. Please select a future or current date.</span>
          </div>
        )}

        {/* Date Selector */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center text-gray-700 font-semibold">
              <Calendar className="w-5 h-5 mr-2" />
              Select Date
            </label>
            <div className="text-sm text-gray-500">
              {isSelectedDatePast ? "🔒 Past dates are read-only" : "✅ Current & future dates are editable"}
            </div>
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-2">
            {generateDates().map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  selectedDate === date
                    ? "ring-2 ring-blue-600 ring-offset-2 " + getDateButtonClass(date)
                    : getDateButtonClass(date) + " hover:shadow-md"
                }`}
              >
                <div className="text-center">
                  <div className="text-xs opacity-75">
                    {date === new Date().toISOString().split('T')[0] && "📅"}
                  </div>
                  <div>{formatDateDisplay(date)}</div>
                  <div className="text-xs mt-1 opacity-75">{getDateStatus(date)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-700">
                {completedCount}/{totalCount} tasks completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 rounded-full h-2 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Add Task Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            {formatDateDisplay(selectedDate)} - {selectedDate}
          </h3>
          
          {isSelectedDatePast ? (
            <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>This date has passed. You cannot add or edit tasks for past dates.</p>
              <p className="text-sm mt-1">Select a current or future date to manage tasks.</p>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="Add a new task..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <button
                onClick={addTask}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          )}
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Tasks</h3>
            {!isSelectedDatePast && totalCount > 0 && (
              <button
                onClick={deleteAllTasksForDate}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Delete All
              </button>
            )}
          </div>
          
          <div className="divide-y divide-gray-200">
            {getDateTodos().length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No tasks for this date</p>
                {!isSelectedDatePast && (
                  <p className="text-sm text-gray-400 mt-1">Add a task using the form above</p>
                )}
              </div>
            ) : (
              getDateTodos().map((task) => (
                <div key={task.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  {editingTask === task.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit(task.id)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(task.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="focus:outline-none"
                          disabled={isSelectedDatePast}
                        >
                          {task.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {task.text}
                        </span>
                      </div>
                      
                      {!isSelectedDatePast && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(task)}
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Dates with Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{Object.keys(todos).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900">
              {Object.values(todos).reduce((sum, tasks) => sum + tasks.length, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Completed Tasks</p>
            <p className="text-2xl font-bold text-green-600">
              {Object.values(todos).reduce((sum, tasks) => sum + tasks.filter(t => t.completed).length, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoPage;
"use client";
import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Circle, 
  Plus, 
  Save, 
  X,
  AlertCircle,
  BarChart3,
  ListTodo,
  CheckCheck
} from "lucide-react";

const TodoPage = () => {
  const [selectedDate, setSelectedDate] = useState("" || new Date().toISOString().split('T')[0]);
  const [todos, setTodos] = useState({});
  const [taskText, setTaskText] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState("");
  const [showPastWarning, setShowPastWarning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, completed, pending

  const [isLoaded, setIsLoaded] = useState(false);
  
  // ✅ Step 1: Load from localStorage
  useEffect(() => {
    try {
      const storedTodos = localStorage.getItem("userTodos");
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoaded(true);
    }
  }, []);
  
  // ✅ Step 2: Save ONLY after load
  useEffect(() => {
    if (!isLoaded) return; // 🚨 prevents overwrite
    localStorage.setItem("userTodos", JSON.stringify(todos));
  }, [todos, isLoaded]);

  useEffect(() => {
    localStorage.setItem("selectedDate", selectedDate);
  }, [selectedDate]);

  const isPastDate = (date) => {
    const today = new Date().toISOString().split('T')[0];
    return date < today;
  };

  const isSelectedDatePast = isPastDate(selectedDate);

  const getDateTodos = () => {
    const dateTodos = todos[selectedDate] || [];
    
    // Apply filters
    let filteredTodos = [...dateTodos];
    
    if (filterStatus === "completed") {
      filteredTodos = filteredTodos.filter(t => t.completed);
    } else if (filterStatus === "pending") {
      filteredTodos = filteredTodos.filter(t => !t.completed);
    }
    
    // Apply search
    if (searchQuery.trim()) {
      filteredTodos = filteredTodos.filter(t => 
        t.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filteredTodos;
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

    if (window.confirm("Are you sure you want to delete all tasks for this date? This action cannot be undone.")) {
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
    if (completedCount === totalCount) return "All done";
    return `${completedCount}/${totalCount}`;
  };

  const getDateButtonClass = (date) => {
    const dateTodos = todos[date] || [];
    const completedCount = dateTodos.filter(t => t.completed).length;
    const totalCount = dateTodos.length;
    
    if (date === selectedDate) {
      return "ring-2 ring-blue-500 ring-offset-2 bg-blue-50 border-blue-500";
    }
    
    if (totalCount === 0) return "bg-white border-gray-200 hover:border-gray-300";
    if (completedCount === totalCount) return "bg-green-50 border-green-300 text-green-700 hover:bg-green-100";
    return "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100";
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
    
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    if (dateStr === todayStr) return "Today";
    if (dateStr === tomorrowStr) return "Tomorrow";
    
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getWeekday = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const completedCount = (todos[selectedDate] || []).filter(t => t.completed).length;
  const totalCount = (todos[selectedDate] || []).length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const totalTasks = Object.values(todos).reduce((sum, tasks) => sum + tasks.length, 0);
  const totalCompleted = Object.values(todos).reduce((sum, tasks) => sum + tasks.filter(t => t.completed).length, 0);
  const datesWithTasks = Object.keys(todos).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
              <p className="text-gray-500 mt-1">Organize your tasks by date</p>
            </div>
            <div className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
              💾 Data saved locally
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
              </div>
              <ListTodo className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{totalCompleted}</p>
              </div>
              <CheckCheck className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Dates</p>
                <p className="text-2xl font-bold text-gray-900">{datesWithTasks}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Warning Message */}
        {showPastWarning && (
          <div className="mb-4 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-amber-500 mr-2" />
              <span className="text-amber-700">Cannot modify past dates. Please select a current or future date.</span>
            </div>
          </div>
        )}

        {/* Date Selector */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="font-semibold text-gray-900">Select Date</h2>
            </div>
            <div className={`text-xs px-2 py-1 rounded ${isSelectedDatePast ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-600'}`}>
              {isSelectedDatePast ? "🔒 Read-only" : "✏️ Editable"}
            </div>
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-2">
            {generateDates().map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${getDateButtonClass(date)}`}
              >
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">{getWeekday(date)}</div>
                  <div className="font-semibold">{formatDateDisplay(date)}</div>
                  <div className="text-xs mt-1 text-gray-500">{getDateStatus(date)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Task Management */}
          <div className="lg:col-span-2">
            {/* Add Task Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                {formatDateDisplay(selectedDate)}
              </h3>
              
              {isSelectedDatePast ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <Clock className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">This date has passed</p>
                  <p className="text-sm text-gray-400 mt-1">Select a current or future date to manage tasks</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={taskText}
                      onChange={(e) => setTaskText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTask()}
                      placeholder="Add a new task..."
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      onClick={addTask}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  
                  {/* Progress Bar */}
                  {totalCount > 0 && (
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{completedCount}/{totalCount}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-green-500 rounded-full h-2 transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tasks List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="font-semibold text-gray-900">Tasks</h3>
                  
                  <div className="flex gap-2">
                    {/* Search */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-8"
                      />
                      <svg className="absolute left-2.5 top-2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    
                    {/* Filter */}
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                    </select>
                    
                    {!isSelectedDatePast && totalCount > 0 && (
                      <button
                        onClick={deleteAllTasksForDate}
                        className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Delete all
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {getDateTodos().length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">
                      {searchQuery || filterStatus !== "all" 
                        ? "No matching tasks found" 
                        : "No tasks for this date"}
                    </p>
                    {!isSelectedDatePast && !searchQuery && filterStatus === "all" && (
                      <p className="text-sm text-gray-400 mt-1">Add a task using the form above</p>
                    )}
                  </div>
                ) : (
                  getDateTodos().map((task) => (
                    <div key={task.id} className="px-5 py-3 hover:bg-gray-50 transition-colors group">
                      {editingTask === task.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && saveEdit(task.id)}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(task.id)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className="focus:outline-none flex-shrink-0"
                              disabled={isSelectedDatePast}
                            >
                              {task.completed ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                              )}
                            </button>
                            <span className={`flex-1 font-bold ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                              {task.text}
                            </span>
                          </div>
                          
                          {!isSelectedDatePast && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEdit(task)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
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
          </div>

          {/* Right Column - Summary & Info */}
          <div className="space-y-6">
            {/* Date Info Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                Date Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Selected Date:</span>
                  <span className="font-medium text-gray-900">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Day:</span>
                  <span className="font-medium text-gray-900">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${isSelectedDatePast ? 'text-gray-500' : 'text-green-600'}`}>
                    {isSelectedDatePast ? 'Past (Read-only)' : 'Active (Editable)'}
                  </span>
                </div>
                {totalCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tasks:</span>
                    <span className="font-medium text-gray-900">{completedCount}/{totalCount} completed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-5">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Quick Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1.5">
                <li>• Click on date buttons to switch between days</li>
                <li>• Past dates are automatically locked</li>
                <li>• All data is saved in your browser</li>
                <li>• Use search to find specific tasks</li>
                <li>• Filter tasks by completion status</li>
              </ul>
            </div>

            {/* Data Info */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">📊 Data Overview</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• {datesWithTasks} date{datesWithTasks !== 1 ? 's' : ''} with tasks</p>
                <p>• {totalTasks} total task{totalTasks !== 1 ? 's' : ''}</p>
                <p>• {totalCompleted} completed task{totalCompleted !== 1 ? 's' : ''}</p>
                <p className="text-xs text-gray-400 mt-2">Data persists across browser sessions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoPage;
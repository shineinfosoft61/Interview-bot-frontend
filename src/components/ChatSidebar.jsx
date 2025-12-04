import React, { useState } from 'react';
import { X, MessageSquare, ChevronDown, Sparkles } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { ChatApi } from '../reduxServices/actions/InterviewAction';
import { useNavigate } from 'react-router-dom';


const ChatSidebar = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const { chat } = useSelector(state => state.InterviewReducer);
  console.log('chat-----------------', chat);

  const handleSubmit = async () => {
    if (!message || !message.trim()) return;
    const payload = {
        question: message.trim(),
    };
    const result = await dispatch(ChatApi(payload));
    if (result?.success && result?.data) {
    }
    setMessage('');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      </div>

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-100 md:w-120 bg-white border-l border-gray-200 shadow-xl z-50 transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b">
          <div className="flex items-center gap-2 text-gray-700">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">JD Assistant</span>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="h-[calc(100%-56px)] flex flex-col">
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto p-4">
            {!chat? (
              <div className="h-full flex items-center justify-center">
                <h2 className="text-xl font-semibold text-gray-800">What can I help you do?</h2>
              </div>
            ) : (
              <div className="space-y-4">
                {(Array.isArray(chat) ? chat : []).map((item, idx) => {
                const q = item?.data?.question;
                const r = item?.data?.response;

                return (
                    <div key={idx} className="space-y-2">
                    {q && (
                        <div className="flex justify-end">
                        <div className="max-w-[90%] rounded-2xl px-4 py-2 bg-gray-100 text-black whitespace-pre-wrap break-words">
                            {q}
                        </div>
                        </div>
                    )}

                    {r && (
                        <div className="flex justify-start">
                        <div className="max-w-[90%] rounded-2xl px-4 py-2 text-gray-800 whitespace-pre-wrap break-words border border-gray-200">
                            {r}
                        </div>
                        </div>
                    )}
                    </div>
                );
                })}
              </div>
            )}
          </div>

          {/* Bottom input area */}
          <div className="border-t p-3">
            <div className="rounded-2xl border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
              <textarea
                rows={3}
                placeholder="What can I help you do?"
                className="w-full resize-none rounded-2xl px-4 py-3 outline-none text-gray-800 placeholder:text-gray-400"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="flex items-center justify-end gap-2 px-3 py-2">
                <button
                  type="button"
                  className="text-[11px] text-gray-600 border rounded-full px-3 py-1 bg-white shadow-sm hover:bg-gray-50 active:bg-gray-100"
                  onClick={handleSubmit}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Floating toggle button (shows when closed as an example usage) */}
      {/* You can control visibility from parent. Here we keep it simple. */}
    </>
  );
};

export default ChatSidebar;

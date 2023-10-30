import React, { useState, useEffect, useRef } from 'react';
import { basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { Language, Event } from '../../constants';
import '../../css/CodeEditor.css';

const CodeEditor = ({ socket, roomId, selectedLanguage }) => {
  const editor = useRef(null);
  const viewRef = useRef(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState(selectedLanguage);

  // Update the code state when the user types
  const onUpdate = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      const updatedCode = update.state.doc.toString();
      setCode(updatedCode);
      sessionStorage.setItem(`codeEditorContent_${roomId}`, updatedCode); // Store the code in session storage
    }
  });

  const getLanguageExtension = (selectedLanguage) => {
    switch (selectedLanguage) {
      case Language.PYTHON:
        return python();
      case Language.JAVA:
        return java();
      case Language.CPP:
        return cpp();
      default:
        return python();
    }
  };

  // Retrieve the stored code from session storage (e.g. when the user refreshes the page)
  useEffect(() => {
    const storedContent = sessionStorage.getItem(`codeEditorContent_${roomId}`);
    if (storedContent) {
      setCode(storedContent);
    }
  }, []);

  // Send code changes to the server
  useEffect(() => {
    socket.emit(Event.Collaboration.CODE_CHANGE, {
      room: roomId,
      updatedCode: code,
    });
  }, [code, roomId, socket]);

  // Send language changes to the server
  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);
    socket.emit(Event.Collaboration.LANGUAGE_CHANGE, {
      room: roomId,
      updatedLanguage: selectedLanguage,
    });
  };

  // Receive code changes from the server
  useEffect(() => {
    socket.on(Event.Collaboration.CODE_UPDATE, (updatedCode) => {
      if (viewRef.current) {
        viewRef.current.dispatch({
          // Replace the entire document with the updated code
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: updatedCode,
          },
          selection: viewRef.current.state.selection, // Preserve the user's cursor position
          scrollIntoView: true, // Preserve the user's scroll position
        });
      }
    });
  }, []);

  // Receive language changes from the server
  useEffect(() => {
    socket.on(Event.Collaboration.LANGUAGE_UPDATE, (updatedLanguage) => {
      const languageSelect = document.getElementById('languageSelect');
      if (languageSelect.value !== updatedLanguage) {
        languageSelect.value = updatedLanguage;
        setLanguage(updatedLanguage);
      }
    });
  }, []);

  // Initialize the editor
  useEffect(() => {
    const state = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        keymap.of([...defaultKeymap, indentWithTab]),
        onUpdate,
        getLanguageExtension(language),
      ],
    });

    const view = new EditorView({ state, parent: editor.current });
    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [language]);

  return (
    <div className='editor-container'>
      <div className='row'>
        <div className='col-sm-2'>
          <select
            className='form-select-sm'
            id='languageSelect'
            defaultValue={language}
            onChange={handleLanguageChange}
          >
            <option value='Python'>Python</option>
            <option value='Java'>Java</option>
            <option value='C++'>C++</option>
          </select>
        </div>
      </div>
      <div className='code-editor'>
        <div ref={editor}></div>
      </div>
    </div>
  );
};

export default CodeEditor;

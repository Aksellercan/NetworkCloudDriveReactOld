import { useState, useEffect, useRef } from "react";
import { downloadFile } from "../Functions/DownloadFile";
import no_thumbnail_file from "../Media/file.png"
import folderIcon from "../Media/folder.png"
import { UploadButton } from "./UploadButton";
import { FilePreviewModal } from "./FilePreviewModal";
import "../Styles/filelist.css"
import { CreateFolder } from "../Functions/CreateFolder";
import { FileItemDTO, FolderItemDTO } from "../types";

const PREVIEW_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg", ".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];

function isPreviewable(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return PREVIEW_EXTENSIONS.some(ext => lower.endsWith(ext));
}

export function FileList() {
  const [folderId, setFolderId] = useState(checkSessionStorageFolderID());
  const [navigationHistory, setNavigationHistory] = useState<number[]>(checkSessionStorageNavigationHistory());
  const [forwardStack, setForwardStack] = useState<Array<{id: number, name: string}>>(checkSessionStorageForwardStack());
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{id: number, name: string}>>(checkSessionStorageBreadcrumbs());
  const [sortType, setSortType] = useState(checkSessionStorageSorting());
  const [filterType, setFilterType] = useState("DEFAULT");
  const [viewMode, setViewMode] = useState(checkLocalStorageViewMode());

  const [files, setFiles] = useState<FileItemDTO[]>([]);
  const [folders, setFolders] = useState<FolderItemDTO[]>([]);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [selectedFolders, setSelectedFolders] = useState<Set<number>>(new Set());

  const [renamingItem, setRenamingItem] = useState<{ type: 'file' | 'folder', id: number, currentName: string } | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [message, setMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItemDTO | null>(null);

  const renameInputRef = useRef<HTMLInputElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  function checkSessionStorageSorting(): string {
    const stored = sessionStorage.getItem("file_list");
    if (stored === null) return "ALPHABETICAL";
    return JSON.parse(stored).sort_type;
  }

  function checkLocalStorageViewMode(): string {
    const stored = localStorage.getItem("file_list");
    if (stored === null) return "GRID";
    return JSON.parse(stored).view_mode;
  }

  function checkSessionStorageNavigationHistory(): number[] {
    const stored = sessionStorage.getItem("file_list");
    if (stored === null) return [0];
    return JSON.parse(stored).navigation_history;
  }

  function checkSessionStorageFolderID(): number {
    const stored = sessionStorage.getItem("file_list");
    if (stored === null) return 0;
    return JSON.parse(stored).current_folder;
  }

  function checkSessionStorageForwardStack(): Array<{id: number, name: string}> {
    const stored = sessionStorage.getItem("file_list");
    if (stored === null) return [];
    return JSON.parse(stored).forward_stack || [];
  }

  function checkSessionStorageBreadcrumbs(): Array<{id: number, name: string}> {
    const stored = sessionStorage.getItem("file_list");
    if (stored === null) return [{ id: 0, name: "Root" }];
    return JSON.parse(stored).breadcrumbs || [{ id: 0, name: "Root" }];
  }

  function updateSessionStorage(currentFolder: number, navHistory: number[], fwdStack: Array<{id: number, name: string}>, crumbs: Array<{id: number, name: string}>) {
    sessionStorage.setItem("file_list", JSON.stringify({
      current_folder: currentFolder,
      navigation_history: navHistory,
      forward_stack: fwdStack,
      sort_type: sortType,
      breadcrumbs: crumbs
    }));
    localStorage.setItem("file_list", JSON.stringify({ view_mode: viewMode }));
  }

  const selectedCount = selectedFiles.size + selectedFolders.size;
  const exactlyOneSelected = selectedCount === 1;

  function toggleSelectMode() {
    setSelectMode(prev => !prev);
    setSelectedFiles(new Set());
    setSelectedFolders(new Set());
    setRenamingItem(null);
    setMessage("");
  }

  function toggleFileSelection(fileId: number) {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  }

  function toggleFolderSelection(folderId: number) {
    setSelectedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  }

  function clearSelection() {
    setSelectedFiles(new Set());
    setSelectedFolders(new Set());
    setRenamingItem(null);
    setMessage("");
  }

  function onSortChange(chosenValue: string) {
    setSortType(chosenValue);
  }

  function onFilterChange(chosenValue: string) {
    setFilterType(chosenValue);
  }

  function onViewModeChange(chosenValue: string) {
    setViewMode(chosenValue);
    localStorage.setItem("file_list", JSON.stringify({ view_mode: chosenValue }));
  }

  function goBack() {
    if (navigationHistory.length <= 1) return;
    const newHistory = [...navigationHistory];
    newHistory.pop();
    const prevFolderId = newHistory[newHistory.length - 1];
    const poppedCrumb = breadcrumbs[breadcrumbs.length - 1];
    const newForwardStack = [...forwardStack, poppedCrumb];
    const newCrumbs = breadcrumbs.slice(0, -1);

    setFolderId(prevFolderId);
    setNavigationHistory(newHistory);
    setForwardStack(newForwardStack);
    setBreadcrumbs(newCrumbs);
    updateSessionStorage(prevFolderId, newHistory, newForwardStack, newCrumbs);
  }

  function goForward() {
    if (forwardStack.length === 0) return;
    const newForwardStack = [...forwardStack];
    const nextCrumb = newForwardStack.pop()!;
    const newHistory = [...navigationHistory, nextCrumb.id];
    const newCrumbs = [...breadcrumbs, nextCrumb];

    setFolderId(nextCrumb.id);
    setNavigationHistory(newHistory);
    setForwardStack(newForwardStack);
    setBreadcrumbs(newCrumbs);
    updateSessionStorage(nextCrumb.id, newHistory, newForwardStack, newCrumbs);
  }

  const fetchFolderInfo = async (currentFolderId: number) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/info/get/foldermetadata?folderid=${currentFolderId}`,
      { method: "GET", credentials: "include" }
    ).then(r => r.json()).catch(e => { console.error(e); return null; });
    return response;
  }

  const fetchFileList = async (currentFolderId: number, sort: string) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/filesystem/list?folderid=${currentFolderId}&sortby=${sort}`,
      { method: "GET", credentials: "include" }
    ).then(r => r.json()).catch(e => { console.error(e); return null; });
    return response;
  }

  const fetchFileListFiltered = async (currentFolderId: number, filter: string) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/filesystem/list?folderid=${currentFolderId}&filterby=${filter}`,
      { method: "GET", credentials: "include" }
    ).then(r => r.json()).catch(e => { console.error(e); return null; });
    return response;
  }

  async function loadData(currentFolderId: number, sort: string, filter: string) {
    let response: any;
    if (filter !== "DEFAULT") {
      response = await fetchFileListFiltered(currentFolderId, filter);
    } else {
      response = await fetchFileList(currentFolderId, sort);
    }
    const infoResponse = await fetchFolderInfo(currentFolderId);
    if (infoResponse) {
      setBreadcrumbs(prev => {
        if (prev.length === 0) return [{ id: infoResponse.id, name: infoResponse.name }];
        const updated = [...prev];
        updated[updated.length - 1] = { id: infoResponse.id, name: infoResponse.name };
        return updated;
      });
    }
    if (response) {
      setFiles(response.files || []);
      setFolders(response.folders || []);
    }
  }

  const dataLoadedRef = useRef(false);
  useEffect(() => {
    loadData(folderId, sortType, filterType);
    updateSessionStorage(folderId, navigationHistory, forwardStack, breadcrumbs);
    dataLoadedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId, sortType, filterType]);

  useEffect(() => {
    if (dataLoadedRef.current) {
      loadData(folderId, sortType, filterType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  useEffect(() => {
    const stored = sessionStorage.getItem("file_list");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!parsed.breadcrumbs && navigationHistory.length > 1) {
        (async () => {
          const newCrumbs: Array<{id: number, name: string}> = [];
          for (const id of navigationHistory) {
            if (id === 0) {
              newCrumbs.push({ id: 0, name: "Root" });
            } else {
              const info = await fetchFolderInfo(id);
              newCrumbs.push({ id: info.id, name: info.name || "?" });
            }
          }
          setBreadcrumbs(newCrumbs);
        })();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  async function handleDeleteSelected() {
    setShowDeleteConfirm(true);
  }

  async function executeDelete() {
    setShowDeleteConfirm(false);
    setMessage("Deleting...");

    const promises: Promise<any>[] = [];

    selectedFiles.forEach(fid => {
      promises.push(
        fetch(`${process.env.REACT_APP_API_URL}/api/filesystem/file/remove?fileid=${fid}`, {
          method: "DELETE",
          credentials: "include"
        }).then(r => r.json())
      );
    });

    selectedFolders.forEach(fid => {
      promises.push(
        fetch(`${process.env.REACT_APP_API_URL}/api/filesystem/folder/remove?folderid=${fid}`, {
          method: "DELETE",
          credentials: "include"
        }).then(r => r.json())
      );
    });

    try {
      await Promise.all(promises);
      setMessage("Deleted successfully");
      clearSelection();
      loadData(folderId, sortType, filterType);
    } catch (e) {
      setMessage("Delete failed");
      console.error(e);
    }
  }

  function startRename(type: 'file' | 'folder', id: number, currentName: string) {
    setRenamingItem({ type, id, currentName });
    setRenameValue(currentName);
    setTimeout(() => renameInputRef.current?.focus(), 0);
  }

  async function confirmRename() {
    if (!renamingItem || renameValue.trim() === "" || renameValue === renamingItem.currentName) {
      setRenamingItem(null);
      return;
    }

    const body = renamingItem.type === 'file'
      ? { file_id: renamingItem.id, name: renameValue.trim() }
      : { folder_id: renamingItem.id, name: renameValue.trim() };

    const endpoint = renamingItem.type === 'file'
      ? `${process.env.REACT_APP_API_URL}/api/filesystem/file/rename`
      : `${process.env.REACT_APP_API_URL}/api/filesystem/folder/rename`;

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).then(r => r.json());

      setRenamingItem(null);
      if (response.success !== false) {
        setMessage("Renamed successfully");
        clearSelection();
        loadData(folderId, sortType, filterType);
      } else {
        setMessage("Rename failed");
      }
    } catch (e) {
      setMessage("Rename failed");
      setRenamingItem(null);
      console.error(e);
    }
  }

  function cancelRename() {
    setRenamingItem(null);
  }

  function handleRenameKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") confirmRename();
    if (e.key === "Escape") cancelRename();
  }

  async function handleMoveHere() {
    if (selectedCount === 0) return;
    setMessage("Moving...");

    const promises: Promise<any>[] = [];

    selectedFiles.forEach(fid => {
      promises.push(
        fetch(`${process.env.REACT_APP_API_URL}/api/filesystem/file/move`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file_id: fid, folder_id: folderId })
        }).then(r => r.json())
      );
    });

    selectedFolders.forEach(fid => {
      promises.push(
        fetch(`${process.env.REACT_APP_API_URL}/api/filesystem/folder/move`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ former_folder_id: fid, destination_folder_id: folderId })
        }).then(r => r.json())
      );
    });

    try {
      await Promise.all(promises);
      setMessage(`Moved ${selectedCount} item(s) here`);
      clearSelection();
      loadData(folderId, sortType, filterType);
    } catch (e) {
      setMessage("Move failed");
      console.error(e);
    }
  }

  function handleFolderNavigate(fld: FolderItemDTO) {
    setFolderId(fld.id);
    setForwardStack([]);
    if (fld.id === 0) {
      setNavigationHistory([0]);
      setBreadcrumbs([{ id: 0, name: "Root" }]);
    } else {
      setNavigationHistory(prev => [...prev, fld.id]);
      setBreadcrumbs(prev => [...prev, { id: fld.id, name: fld.name }]);
    }
  }

  function navigateToBreadcrumb(index: number) {
    const targetCrumb = breadcrumbs[index];
    const newHistory = navigationHistory.slice(0, index + 1);
    const newCrumbs = breadcrumbs.slice(0, index + 1);

    setFolderId(targetCrumb.id);
    setNavigationHistory(newHistory);
    setBreadcrumbs(newCrumbs);
    setForwardStack([]);
    updateSessionStorage(targetCrumb.id, newHistory, [], newCrumbs);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div id="navigationDiv">
          <button className="nav-btn back-btn" onClick={goBack} disabled={navigationHistory.length <= 1}>
            ← Back
          </button>
          <button className="nav-btn forward-btn" onClick={goForward} disabled={forwardStack.length === 0}>
            Forward →
          </button>
        </div>
        <div ref={menuContainerRef} style={{ position: 'relative' }}>
          <button className="add-btn" onClick={() => setShowMenu(prev => !prev)}>+</button>
          {showMenu && (
            <div className="popup-menu">
              <CreateFolder currentFolderId={folderId} />
              <UploadButton currentFolderId={folderId} />
              <button
                className={`popup-btn select-mode-btn ${selectMode ? 'active' : ''}`}
                onClick={toggleSelectMode}
              >
                {selectMode ? 'Exit Select Mode' : 'Select Mode'}
              </button>
              <label className="popup-label">
                Sort:
                <select value={sortType} onChange={e => onSortChange(e.target.value)}>
                  <option value="DEFAULT">No sorting</option>
                  <option value="ALPHABETICAL">A-Z</option>
                  <option value="REVERSE_ALPHABETICAL">Z-A</option>
                  <option value="NEWEST">Newest first</option>
                  <option value="OLDEST">Oldest first</option>
                  <option value="SIZE">Size highest</option>
                  <option value="SIZE_LOWEST">Size lowest</option>
                </select>
              </label>
              <label className="popup-label">
                Filter:
                <select value={filterType} onChange={e => onFilterChange(e.target.value)}>
                  <option value="DEFAULT">No filter</option>
                  <option value="FILES_ONLY">Files only</option>
                  <option value="FOLDERS_ONLY">Folders only</option>
                  <option value="KEYWORD">Keyword</option>
                </select>
              </label>
              <label className="popup-label">
                View:
                <select value={viewMode} onChange={e => onViewModeChange(e.target.value)}>
                  <option value="GRID">Grid</option>
                  <option value="LIST">List</option>
                </select>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="breadcrumb-bar">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.id} className="breadcrumb-item">
            {index > 0 && <span className="breadcrumb-separator"> / </span>}
            {index === breadcrumbs.length - 1 ? (
              <span className="breadcrumb-current">{crumb.name}</span>
            ) : (
              <span className="breadcrumb-link" onClick={() => navigateToBreadcrumb(index)}>
                {crumb.name}
              </span>
            )}
          </span>
        ))}
      </div>

      {selectedCount > 0 && (
        <div className="action-bar">
          <span className="action-bar-info">{selectedCount} item(s) selected</span>
          <button className="action-btn delete-btn" onClick={handleDeleteSelected}>
            Delete Selected
          </button>
          {exactlyOneSelected && !renamingItem && (
            <button
              className="action-btn rename-btn"
              onClick={() => {
                const file = files.find(f => selectedFiles.has(f.id));
                const folder = folders.find(f => selectedFolders.has(f.id));
                if (file) startRename('file', file.id, file.name);
                if (folder) startRename('folder', folder.id, folder.name);
              }}
            >
              Rename
            </button>
          )}
          <button className="action-btn move-btn" onClick={handleMoveHere}>
            Move {selectedCount} item(s) here
          </button>
          <button className="action-btn cancel-selection-btn" onClick={clearSelection}>
            Cancel Selection
          </button>
        </div>
      )}

      {message && <p className="list-message">{message}</p>}

      <div id="list-outer" className="fileListDiv">
        {folders.length > 0 && (
          <div id="folderList" className="folderDiv">
            {folders.map(fld => (
              <div
                key={`folder-${fld.id}`}
                className={`folder ${viewMode === "LIST" ? "list-view" : ""} ${selectedFolders.has(fld.id) ? "selected" : ""}`}
              >
                {selectMode && (
                  <input
                    type="checkbox"
                    className="item-checkbox"
                    checked={selectedFolders.has(fld.id)}
                    onChange={() => toggleFolderSelection(fld.id)}
                    onClick={e => e.stopPropagation()}
                  />
                )}
                <img
                  src={folderIcon}
                  alt="folder"
                  onClick={() => handleFolderNavigate(fld)}
                />
                {renamingItem && renamingItem.type === 'folder' && renamingItem.id === fld.id ? (
                  <input
                    ref={renameInputRef}
                    className="rename-input"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onKeyDown={handleRenameKeyDown}
                    onBlur={confirmRename}
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <p onClick={() => handleFolderNavigate(fld)}>{fld.name}</p>
                )}
              </div>
            ))}
          </div>
        )}
        {files.length > 0 && (
          <div id="fileList" className="fileDiv">
            {files.map(f => (
              <div
                key={`file-${f.id}`}
                className={`file ${viewMode === "LIST" ? "list-view" : ""} ${selectedFiles.has(f.id) ? "selected" : ""}`}
              >
                {selectMode && (
                  <input
                    type="checkbox"
                    className="item-checkbox"
                    checked={selectedFiles.has(f.id)}
                    onChange={() => toggleFileSelection(f.id)}
                    onClick={e => e.stopPropagation()}
                  />
                )}
                <img
                  src={f.hasThumbnail
                    ? `${process.env.REACT_APP_API_URL}/api/thumbnails/getbyfileid?fileId=${f.id}`
                    : no_thumbnail_file
                  }
                  alt="file"
                  onClick={() => isPreviewable(f.name) ? setPreviewFile(f) : downloadFile(f.id)}
                />
                {renamingItem && renamingItem.type === 'file' && renamingItem.id === f.id ? (
                  <input
                    ref={renameInputRef}
                    className="rename-input"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onKeyDown={handleRenameKeyDown}
                    onBlur={confirmRename}
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <p onClick={() => isPreviewable(f.name) ? setPreviewFile(f) : downloadFile(f.id)}>{f.name}</p>
                )}
              </div>
            ))}
          </div>
        )}
        {files.length === 0 && folders.length === 0 && (
          <p className="empty-folder">This folder is empty</p>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete {selectedCount} item(s)? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="modal-btn confirm-delete-btn" onClick={executeDelete}>
                Yes, Delete
              </button>
              <button className="modal-btn cancel-modal-btn" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {previewFile && (
        <FilePreviewModal
          fileId={previewFile.id}
          fileName={previewFile.name}
          onClose={() => setPreviewFile(null)}
          onDeleted={() => { setPreviewFile(null); loadData(folderId, sortType, filterType); }}
          onRenamed={() => { setPreviewFile(null); loadData(folderId, sortType, filterType); }}
        />
      )}
    </div>
  );
}

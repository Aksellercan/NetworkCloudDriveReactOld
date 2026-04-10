import { useState } from 'react';
import { StartScan, StartScanWithOptions, ScanResponse, ScanDepthOption, ScanThumbnailOption } from '../Functions/StartScan';
import { convertToNumber } from '../Functions/Numbers';
import '../Styles/settings.css';

const DEPTH_OPTIONS: ScanDepthOption[] = [
  'NORMAL',
  'GO_INTO_FOLDERS',
  'DONT_GO_INTO_FOLDERS',
  'ONLY_FOLDERS',
  'ONLY_FILES',
];

const THUMBNAIL_OPTIONS: ScanThumbnailOption[] = [
  'CREATE_THUMBNAILS',
  'DONT_CREATE_THUMBNAILS',
  'ONLY_THUMBNAILS',
];

export function SettingsPage() {
  const [folderId, setFolderId] = useState(0);
  const [selectedDepth, setSelectedDepth] = useState<ScanDepthOption>('NORMAL');
  const [selectedThumbnail, setSelectedThumbnail] = useState<ScanThumbnailOption | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFolderIdChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFolderId(convertToNumber(e.currentTarget.value, 0));
    setError(null);
  }

  function handleDepthChange(option: ScanDepthOption) {
    setSelectedDepth(option);
    setError(null);
  }

  function handleThumbnailChange(option: ScanThumbnailOption) {
    setSelectedThumbnail(selectedThumbnail === option ? null : option);
    setError(null);
  }

  async function handleNormalScan() {
    if (folderId < 0) {
      setError('Please enter a valid folder ID');
      return;
    }
    setLoading(true);
    setError(null);
    setScanResult(null);
    try {
      const result = await StartScan(folderId);
      setScanResult(result);
    } catch {
      setError('Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleScanWithOptions() {
    if (folderId < 0) {
      setError('Please enter a valid folder ID');
      return;
    }
    setLoading(true);
    setError(null);
    setScanResult(null);
    try {
      const result = await StartScanWithOptions(folderId, selectedDepth, selectedThumbnail);
      setScanResult(result);
    } catch {
      setError('Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <div className="settings-section">
        <label htmlFor="folder-id" className="settings-label">Folder ID:</label>
        <input
          id="folder-id"
          type="number"
          min={0}
          value={folderId}
          onChange={handleFolderIdChange}
          className="settings-input"
          disabled={loading}
        />
      </div>

      <div className="settings-section">
        <h2 className="settings-subtitle">Scan Options</h2>

        <div className="options-groups">
          <fieldset className="options-group">
            <legend>Scan Depth</legend>
            {DEPTH_OPTIONS.map((option) => (
              <label key={option} className="radio-option">
                <input
                  type="radio"
                  name="depth"
                  value={option}
                  checked={selectedDepth === option}
                  onChange={() => handleDepthChange(option)}
                  disabled={loading}
                />
                <span>{option.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </fieldset>

          <fieldset className="options-group">
            <legend>Thumbnails</legend>
            {THUMBNAIL_OPTIONS.map((option) => (
              <label key={option} className="radio-option">
                <input
                  type="radio"
                  name="thumbnail"
                  value={option}
                  checked={selectedThumbnail === option}
                  onChange={() => handleThumbnailChange(option)}
                  disabled={loading}
                />
                <span>{option.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </fieldset>
        </div>
      </div>

      <div className="settings-section scan-buttons">
        <button
          onClick={handleNormalScan}
          disabled={loading}
          className="settings-button"
        >
          {loading ? 'Scanning...' : 'Normal Scan'}
        </button>
        <button
          onClick={handleScanWithOptions}
          disabled={loading}
          className="settings-button primary"
        >
          {loading ? 'Scanning...' : 'Scan with Options'}
        </button>
      </div>

      {error && (
        <div className="settings-error">
          {error}
        </div>
      )}

      {scanResult && (
        <div className={`settings-result ${scanResult.success ? 'success' : 'failure'}`}>
          <h3>{scanResult.message}</h3>
          <div className="result-metadata">
            <p><strong>Discovered:</strong> {scanResult.object.discoveredFiles} files, {scanResult.object.discoveredFolders} folders</p>
            <p><strong>Created:</strong> {scanResult.object.createdFiles} files, {scanResult.object.createdFolders} folders</p>
            <p><strong>Time taken:</strong> {scanResult.object.timeTaken} ms</p>
          </div>
        </div>
      )}
    </div>
  );
}

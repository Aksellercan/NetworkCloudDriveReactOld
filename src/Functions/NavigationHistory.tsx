export class NavigationHistory {
    folderIdhistory: number[] = [];

    navigationHistory() {}

    pushToHistory(id: number) {
        for (let i = 0; i < history.length; i++) {
            if (this.folderIdhistory[i] === id) {
                return;
            }
        }
        this.folderIdhistory.push(id);
    }

    getHistoryAtIndex(index: number): number {
        return this.folderIdhistory.at(index)!;
    }
}
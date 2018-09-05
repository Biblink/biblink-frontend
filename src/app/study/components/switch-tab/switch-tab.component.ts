import { Component, Output, EventEmitter, Input } from '@angular/core'

@Component({
    selector: 'switch-tab',
    templateUrl: './switch-tab.component.html',
    styleUrls: ['./switch-tab.component.css']
})

export class SwitchTabComponent {
    activeTab: string = 'feed';
    @Input() isLeader = false;
    @Output() tab = new EventEmitter<string>();

    switchTab(tab: string) {
        this.activeTab = tab;
        this.tab.emit(tab)
    }
}
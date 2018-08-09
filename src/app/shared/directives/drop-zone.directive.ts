import { Directive, HostListener, HostBinding, Output, EventEmitter } from '@angular/core';

/**
 * Directive to handle file drop zones
 */
@Directive({
  selector: '[dropZone]'
})
export class DropZoneDirective {
  /**
   * Output emitter to emit list of files
   */
  @Output() dropped = new EventEmitter<FileList>();
  /**
   * Output emitter to emit if drop zone is hovered
   */
  @Output() hovered = new EventEmitter<boolean>();

  /**
   * Initializes necessary dependencies and dependency injection
   */
  constructor() { }
  /**
   * Listener to a drop event
   * @param $event the event of a drop
   */
  @HostListener('drop', [ '$event' ])
  onDrop($event) {
    $event.preventDefault();
    this.dropped.emit($event.dataTransfer.files);
    this.hovered.emit(false);
  }
  /**
   * Listener to a dragover event
   * @param $event the event of a dragover
   */

  @HostListener('dragover', [ '$event' ])
  onDragOver($event) {
    $event.preventDefault();
    this.hovered.emit(true);
  }
  /**
   * Listener to a dragleave event
   * @param $event the event of a dragleave
   */

  @HostListener('dragleave', [ '$event' ])
  onDragLeave($event) {
    $event.preventDefault();
    this.hovered.emit(false);
  }

}

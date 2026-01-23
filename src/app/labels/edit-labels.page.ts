import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabelService } from '../core/services/label.service';
import { Label } from '../core/models/label.model';

@Component({
  selector: 'app-edit-labels',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-labels.page.html',
  styleUrls: ['./edit-labels.page.css']
})
export class EditLabelsPage implements OnInit {
  labels: Label[] = [];
  newLabelName = '';
  editingLabelId: number | null = null;
  editingLabelName = '';

  constructor(private labelService: LabelService) {}

  ngOnInit(): void {
    this.loadLabels();
  }

  loadLabels(): void {
    this.labelService.getAll().subscribe({
      next: (labels) => {
        this.labels = labels;
      },
      error: (err) => console.error('Failed to load labels:', err)
    });
  }

  createLabel(): void {
    if (!this.newLabelName.trim()) return;

    this.labelService.create(this.newLabelName.trim()).subscribe({
      next: () => {
        this.newLabelName = '';
        this.loadLabels();
      },
      error: (err) => console.error('Failed to create label:', err)
    });
  }

  startEditing(label: Label): void {
    this.editingLabelId = label.labelId;
    this.editingLabelName = label.labelName;
  }

  cancelEditing(): void {
    this.editingLabelId = null;
    this.editingLabelName = '';
  }

  saveLabel(labelId: number): void {
    if (!this.editingLabelName.trim()) return;

    this.labelService.update(labelId, this.editingLabelName.trim()).subscribe({
      next: () => {
        this.editingLabelId = null;
        this.editingLabelName = '';
        this.loadLabels();
      },
      error: (err) => console.error('Failed to update label:', err)
    });
  }

  deleteLabel(labelId: number): void {
    this.labelService.delete(labelId).subscribe({
      next: () => {
        this.loadLabels();
      },
      error: (err) => console.error('Failed to delete label:', err)
    });
  }
}

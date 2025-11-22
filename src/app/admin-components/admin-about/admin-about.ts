import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-about',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-about.html',
  styleUrl: './admin-about.scss'
})
export class AdminAbout {
   // Inspiring Words
  inspiringWord = '';
  inspiringWords: string[] = [];

  addInspiringWord() {
    const w = this.inspiringWord.trim();
    if (!w) return;

    if (this.inspiringWords.length === 4) return; // max 4 words

    if (!this.inspiringWords.some(x => x.toLowerCase() === w.toLowerCase())) {
      this.inspiringWords.push(w);
    }

    this.inspiringWord = '';
  }

  removeInspiringWord(i: number) {
    this.inspiringWords.splice(i, 1);
  }

  // Descriptions
  mainDescription = '';
  howIGotHere = '';
  additional1 = '';
  additional2 = '';

  // Get payload for backend
  getPayload() {
    return {
      inspiringWords: this.inspiringWords,
      mainDescription: this.mainDescription,
      howIGotHere: this.howIGotHere,
      additionalDescription: {
        paragraph1: this.additional1,
        paragraph2: this.additional2
      }
    };
  }
}

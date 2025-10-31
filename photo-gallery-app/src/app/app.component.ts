import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'photo-gallery-app';
  private readonly _destroying$ = new Subject<void>();

  constructor(private msalService: MsalService) {}

  ngOnInit(): void {
    this.msalService.handleRedirectObservable()
      .pipe(takeUntil(this._destroying$))
      .subscribe();
  }

  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }
}

import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { LoggingService, NotificationService } from '@services';

@Injectable()
export class ErrorsHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: Error | HttpErrorResponse) {
    const notifier = this.injector.get(NotificationService);
    const logger = this.injector.get(LoggingService);

    if (!navigator.onLine) {
      notifier.showError('Browser Offline!');
    } else {
      if (error instanceof HttpErrorResponse) {
        if (!navigator.onLine) {
          notifier.showError(error.message);
        } else if (error.status !== 401) {
          notifier.showError('Http Error: ' + error.message);
        }
      } else {
        notifier.showError('Client Error: ' + error.message);
      }
      logger.logError(error);
    }
  }
}

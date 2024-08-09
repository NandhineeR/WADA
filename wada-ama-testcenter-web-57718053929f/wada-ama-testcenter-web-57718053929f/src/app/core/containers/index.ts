import { AppComponent } from './app/app.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TooltipContainerComponent } from './tooltip-container/tooltip-container.component';
import { TranslationsComponent } from './translations/translations.component';

export const containers: Array<any> = [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    TooltipContainerComponent,
    TranslationsComponent,
];

export * from './app/app.component';
export * from './header/header.component';
export * from './sidebar/sidebar.component';
export * from './tooltip-container/tooltip-container.component';
export * from './translations/translations.component';

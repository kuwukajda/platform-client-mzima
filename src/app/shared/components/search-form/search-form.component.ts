import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { NavigationStart, Router } from '@angular/router';
import { searchFormHelper } from '@helpers';
import { CategoryInterface, Savedsearch, SurveyItem } from '@models';
import { CategoriesService, PostsService, SurveysService } from '@services';
import { filter, map } from 'rxjs';
import { SavedsearchesService } from 'src/app/core/services/savedsearches.service';
import { MultilevelSelectOption } from '../multilevel-select/multilevel-select.component';
import { SaveSearchModalComponent } from '../save-search-modal/save-search-modal.component';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss'],
})
export class SearchFormComponent {
  @ViewChild('select') select: MatSelect;
  public _array = Array;
  public onFocus = false;
  public isDropdownOpen = false;
  public form: FormGroup = this.formBuilder.group({
    query: [],
    status: [],
    tags: [],
    source: [],
    form: [],
    date_after: [],
    date_before: [],
    center_point: [
      {
        location: {
          lat: null,
          lng: null,
        },
        distance: 1,
      },
    ],
  });
  public activeFilters: any;
  public sortingOptions = searchFormHelper.sortingOptions;
  public savedsearches: Savedsearch[];
  public statuses = searchFormHelper.statuses;
  public surveyList: SurveyItem[] = [];
  public sources = searchFormHelper.sources;
  public categories: CategoryInterface[];
  public categoriesData: MultilevelSelectOption[];
  public activeSavedSearch?: Savedsearch;
  public activeSavedSearchValue?: string;
  public total: number;
  public onMapPostsCount: number;
  public isMapView: boolean;
  public activeFiltersCount?: number;

  constructor(
    private formBuilder: FormBuilder,
    private savedsearchesService: SavedsearchesService,
    private surveysService: SurveysService,
    private categoriesService: CategoriesService,
    private dialog: MatDialog,
    private postsService: PostsService,
    private router: Router,
  ) {
    this.getSavedFilters();

    this.surveysService.get().subscribe({
      next: (response) => {
        this.surveyList = response.results;
      },
    });

    this.categoriesService.get().subscribe({
      next: (response) => {
        this.categories = response;
        this.categoriesData = response?.results?.map((category: CategoryInterface) => {
          return {
            id: category.id,
            name: category.tag,
            children: response?.results
              ?.filter((cat: CategoryInterface) => cat.parent_id === category.id)
              .map((cat: CategoryInterface) => {
                return {
                  id: cat.id,
                  name: cat.tag,
                };
              }),
          };
        });
      },
    });

    this.postsService.totalPosts$.subscribe({
      next: (total) => {
        this.total = total;
      },
    });

    this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe({
      next: (params: any) => {
        this.isMapView = params.url === '/map';
      },
    });

    this.form.valueChanges.subscribe({
      next: (values) => {
        const filters: any = {
          'source[]': values.source,
          'status[]': values.status,
          'form[]': values.form,
          'tags[]': values.tags,
          date_after: values.date_after ? new Date(values.date_after).toISOString() : null,
          date_before: values.date_before ? new Date(values.date_before).toISOString() : null,
          q: values.query,
          center_point:
            values.center_point?.location?.lat && values.center_point?.location?.lng
              ? [values.center_point.location.lat, values.center_point.location.lng].join(',')
              : null,
        };

        this.activeFilters = {};
        for (const key in filters) {
          if (!filters[key] || !filters[key].length) continue;
          this.activeFilters[key] = filters[key];
        }

        this.activeFiltersCount = Object.keys(this.activeFilters).length || undefined;
      },
    });
  }

  private getSavedFilters(): void {
    this.savedsearchesService
      .get()
      .pipe(
        map((response) => {
          response.results.map((search) => {
            if (search.filter?.status === 'all') {
              search.filter.status = ['published', 'draft', 'archived'];
            }

            if (search.filter?.center_point || search.filter?.within_km) {
              const latLng = search.filter.center_point?.split(',');
              search.filter.center_point = {
                location: {
                  lat: Number(latLng[0]),
                  lng: Number(latLng[1]),
                },
                distance: search.filter.within_km || 1,
              };
            }
          });

          return response;
        }),
      )
      .subscribe({
        next: (response) => {
          this.savedsearches = response.results;
        },
      });
  }

  public setSortingValue(option: any, value: any): boolean {
    return option.order === value.order && option.orderBy === value.orderBy;
  }

  public inputOnFocus(): void {
    this.onFocus = true;
  }

  public inputOnBlur(): void {
    this.onFocus = false;
  }

  public saveSearch(search?: Savedsearch): void {
    const dialogRef = this.dialog.open(SaveSearchModalComponent, {
      width: '100%',
      maxWidth: 480,
      height: 'auto',
      maxHeight: '90vh',
      data: {
        search,
      },
    });

    dialogRef.afterClosed().subscribe({
      next: (result: any) => {
        if (!result || result === 'cancel') return;

        if (result === 'delete') {
          if (this.activeSavedSearch?.id) {
            this.savedsearchesService.delete(this.activeSavedSearch.id).subscribe({
              next: () => {
                this.form.enable();
                this.resetSavedFilter();
                this.getSavedFilters();
              },
            });
          }
          return;
        }

        this.form.disable();

        const filters: any = {};
        for (const key in this.activeFilters) {
          filters[key.replace(/\[\]/g, '')] = this.activeFilters[key];
        }

        const savedSearchParams = {
          filter: filters,
          name: result.name,
          description: result.description,
          featured: result.featured,
          role: result.visible_to.value === 'specific' ? result.visible_to.options : ['admin'],
          view: result.defaultViewingMode,
        };

        if (this.activeSavedSearch && this.activeSavedSearch.id) {
          this.savedsearchesService
            .update(this.activeSavedSearch.id, {
              ...this.activeSavedSearch,
              ...savedSearchParams,
            })
            .subscribe({
              next: () => {
                this.form.enable();
                this.getSavedFilters();
              },
            });
        } else {
          this.savedsearchesService
            .post({
              ...savedSearchParams,
            })
            .subscribe({
              next: () => {
                this.form.enable();
                this.getSavedFilters();
              },
            });
        }
      },
    });
  }

  public applySavedFilter(event: MatSelectChange): void {
    this.activeSavedSearch = this.savedsearches.find((search) => search.id === event.value);

    if (this.activeSavedSearch) {
      if (
        this.activeSavedSearch.filter.form &&
        !this._array.isArray(this.activeSavedSearch.filter.form)
      ) {
        this.activeSavedSearch.filter.form = [this.activeSavedSearch.filter.form];
      }
      if (
        this.activeSavedSearch.filter.status &&
        !this._array.isArray(this.activeSavedSearch.filter.status)
      ) {
        this.activeSavedSearch.filter.status = [this.activeSavedSearch.filter.status];
      }
      if (
        this.activeSavedSearch.filter.tags &&
        !this._array.isArray(this.activeSavedSearch.filter.tags)
      ) {
        this.activeSavedSearch.filter.tags = [this.activeSavedSearch.filter.tags];
      }
      if (
        this.activeSavedSearch.filter.source &&
        !this._array.isArray(this.activeSavedSearch.filter.source)
      ) {
        this.activeSavedSearch.filter.source = [this.activeSavedSearch.filter.source];
      }

      this.resetForm(this.activeSavedSearch.filter);
    } else {
      this.resetForm();
    }
  }

  public resetSavedFilter(): void {
    this.activeSavedSearch = undefined;
    this.activeSavedSearchValue = undefined;
    this.resetForm();
  }

  public toggleDropdown(state?: boolean): void {
    this.isDropdownOpen = state || !this.isDropdownOpen;
  }

  public applyFilters(): void {
    this.postsService.applyFilters(this.activeFilters);

    this.toggleDropdown(false);
  }

  public resetForm(filters: any = {}): void {
    this.form.patchValue({
      query: '',
      status: [],
      tags: [],
      source: [],
      form: [],
      date_after: '',
      date_before: '',
      center_point: {
        location: {
          lat: null,
          lng: null,
        },
        distance: 1,
      },
      ...filters,
    });
  }
}

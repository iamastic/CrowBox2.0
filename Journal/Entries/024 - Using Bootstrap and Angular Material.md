## Using Bootstrap and Angular Material

Given that I am building the frontend in Angular, it made sense to use the native styling libraries from [Angular Material](https://material.angular.io/). However, in the Data component page, I make use of two charts. To display the two charts, I wanted to sit them in a carousel so that the user may cycle through and switch between the charts. Angular Material appears to not provide any simple integration of carousels. So I resorted to using bootstrap. 

After installing bootstrap, I also installed [ng-bootstrap](https://ng-bootstrap.github.io/#/home). This is a wrapper library that allows you to use angular directives when styling with bootstrap. 

Using the library was quite simple. To build the carousel, I simply used the code provided by the [documentation page](https://ng-bootstrap.github.io/#/components/carousel/examples) of the library. They provided numerous examples from which I bits and pieces to help achieve what I intended to build. All of the examples cyle through a list of items (images in this case) using the `*ngFor` directive. As I did not have a list of items, I had to use the preset chart builds instead. Here is the final output of the carousel holding two charts: 

```html
<div *ngIf="showPublicData === false">
    <ngb-carousel #carousel id = "chartsCarousel" [interval] = "false">
        <ng-template ngbSlide>
            <div id = "crowOnPerchChart">
                <canvas baseChart
                    [datasets]="crowOnPerchChartData"
                    [labels]="crowOnPerchChartLabels"
                    [options]="crowOnPerchChartOptions"
                    [legend]="crowOnPerchChartLegend"
                    [chartType]="crowOnPerchChartType"
                    [colors]="crowOnPerchChartColor"
                    >
                </canvas>
            </div>
        </ng-template>
    
        <ng-template ngbSlide>
            <div id = "coinsDepositedChart">
                <canvas baseChart
                        [datasets]="coinsDepositedChartData"
                        [labels]="coinsDepositedChartLabels"
                        [options]="coinsDepositedChartOptions"
                        [legend]="coinsDepositedChartLegend"
                        [chartType]="coinsDepositedChartType"
                        [colors]="coinChartColor"
                        >
                </canvas>
            </div>
        </ng-template>
    </ngb-carousel>
</div>
```
By using the `ngbSlide` directive, I identified the two elements (the two charts) that needed to be a part of the carousel. The carousel allows the user to slide left and right, switching between the two charts, as can be seen below:


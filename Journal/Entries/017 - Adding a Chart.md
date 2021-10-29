## Adding a Chart
### 20/10/21

To work with displaying charts, I decided to import a well known library; [Chart.js](https://www.chartjs.org/). This library allows the programmer to create multiple types of charts and handle them easily. To assist me in creating charts, I also imported the following library: [ng2-charts](https://valor-software.com/ng2-charts/#/BarChart). This library allows the programmer to use Angular directives to manipulate and create charts, making it work seamlessly with Angular. 

The first step I took was to understand how the chart.js library functions. 

In `app.module.ts` I imported the following module: 

```js
import {ChartsModule} from 'ng2-charts';
```

Then, in the `component.ts` file, I create the object for the chart which includes all the details of the chart. 

```js
  public barChartOptions = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{}], yAxes: [{
      display:true,
      ticks: {
        beginAtZero: true
      }
    }] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
```

Here, `barChartOptions` sets up the metadata such as how the y axis should appear. 

Then, I set up some parameters to be displayed on the chart, such as the labels, the type of the chart as well as whether or not a legend should appear. 
```js
  public barChartLabels = ['Current'];
  public barChartType = 'bar';
  public barChartLegend = true;
```

Finally, I set up the data. In the sample code provided by the ng2-charts library, they made use of a fixed set of data such as:
```js
public barChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' }
  ];
```

However, the data I plan on using will dynamically change. For example, one bar chart will be displaying the number of coins deposited. As a crow drops another coin in the coin slot, the bar chart should respond immediately. To achieve this, I first created an array:
```js
  coinsData = [0];
```
In java script, arrays have inbuilt dynamic memory allocation and as such, I simply need to `push` data into the array. In this basic scenario, however, I am only working with 1 data value i.e. the number of coins deposited. As such, I did not need to make use of the dynamic memory allocation. 

The code works by grabbing the database list reference, creating an Observable in the form of a snapshot of the data, and then subscribing to said Observable. During the subscription, I receive the data value of the coins deposited and then set the 1st cell of the `coinsData` array to the value retrieved. I then reset the `barChartData` details and this automatically updates the chart. 

```js
    this.displayCoins.subscribe(data =>
      {
        this.chartCoinDeposited = data[0].coins_deposited;
        this.coinsData[0] = this.chartCoinDeposited;

        this.barChartData = [
          { data: this.coinsData, label: 'Coins Deposited' },
          { data: this.perchData, label: 'Crows Landed On Perch'}
        ];
      }
    )
```

Then, in the `component.html` view, I bind the data. 

```html
<div>
    <div id = "chart">
        <canvas baseChart
                [datasets]="barChartData"
                [labels]="barChartLabels"
                [options]="barChartOptions"
                [legend]="barChartLegend"
                [chartType]="barChartType"
                >
        </canvas>
    </div>
</div>
```

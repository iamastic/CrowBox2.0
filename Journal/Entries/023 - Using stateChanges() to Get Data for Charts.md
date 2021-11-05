## Using stateChanges() to Get Data for Charts

In a previous journal, I wrote about how I integrated the `chart.js` library into the project in order to display the data. That was prior to me introducing the real time updates with the date as a factor. Earlier, the data, for example the number of coins deposited, occupied only once cell of the array. When including dates, there will be multiple cells of the array being occupied. For example, instead of having only 1 bar that shows the total number of coins deposited, there will be several bars showing the total number of coins deposited per date. As a result, the array will grow over time. I did not want to constantly have to load in all the data each time there is a change. That seems highly ineffective. 

Fortunately, AngularFire library offers a function `stateChanges()` which can be used instead of `snapshotChanges()`. Instead of retrieving a list of the entire snapshot, it only retrieves the children that are newly added. Here is an example of how I set up and initalised the charts:

```js
  getCoinDepositedDataChildren() {
    //get snapshot of child added 
    this.$childCoinsDepositedSub = this.crowboxService
    .getCoinDepositedData()
    .stateChanges();

    this.$childCoinsDepositedSub
    .subscribe(action => {
      //get index of the key from the date array
      let indexOfKey = this.coinsDepositedDate.indexOf(action.key);
      //if the index is -1, then the date does not currently exist
      //this means that it is a new date, so we push it onto the array
      //since it is a new date, we also push on the value onto the value
      //array
      if (indexOfKey == -1) {
        this.coinsDepositedDate.push(action.key);
        this.coinsDepositedValues.push(action.payload.val().value);
      } else {
        //if it does exist, then we don't need to add the new date
        //simply replace the existing data value with the new data value
        //for the same date 
        this.coinsDepositedValues[indexOfKey] = action.payload.val().value;
      }

      //reset the bar charts data as well as labels
      this.coinsDepositedChartLabels = this.coinsDepositedDate;
      this.coinsDepositedChartData = [
        { data: this.coinsDepositedValues, label: "Number of Coins Deposited" }
      ];
    });
  }
```

As a result, when the site first starts up, each element from the firebase database is considered as a child node. Thus, the array is filled up. Everytime a new child node is added (i.e. a new date), the two arrays grow respectively. If, however, a node is altered (i.e. a coin is deposited on the same date), then only one array grows in the correct index. 

/*
 kanton-bern-finanzen https://github.com/KeeTraxx/kanton-bern-finanzen
 Copyright (C) 2014  Khôi Tran

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var path = require('path');
var util = require('util');
var fs = require('fs');
var excel = require('excel');

var _ = require('underscore');
var data;

excel('input.xlsx', function(err, arr) {
  if(err) throw err;
  data = arr;
  var out = [];
  var i = 1;
  var baseYear = 2013;
  
  var years = [];
  
  for(var col = 9; col < data[0].length; col+=4) {
    var year = baseYear - (col - 9) / 4;
    years.push(year);
  }
  
  while(data[i][0] != '') {
    var row = data[i]
    /* code here */
    var code = row[0];
    var superCat = row[1];
    var subCat = row[2];
    
    var superCatOut = out[superCat];
    
    if(superCatOut == undefined) {
      var superCatOut = {id: code.split('.')[0], name: superCat, gross_cost: { budgets: {}, accounts: {}}, revenue: { budgets: {}, accounts: {}}, children: []}
      
      for(var j = 0; j < years.length; j++) {
        var year = years[j];
        superCatOut.gross_cost.accounts[year] = 0;
        superCatOut.revenue.accounts[year] = 0;
        superCatOut.gross_cost.budgets[year] = 0;
        superCatOut.revenue.budgets[year] = 0;
      }
    }
    
    

    var childOut = {id: code, name: subCat, gross_cost: { budgets: {}, accounts: {}}, revenue: { budgets: {}, accounts: {}}}
    
    var sums = {};
    
    for(var col = 9; col < row.length; col+=4) {
      var year = baseYear - (col - 9) / 4;
      childOut.gross_cost.accounts[year] = parseInt(row[col]) || 0;
      childOut.revenue.accounts[year] = parseInt(row[col+1]) || 0;
      childOut.gross_cost.budgets[year] = parseInt(row[col+2]) || 0;
      childOut.revenue.budgets[year] = parseInt(row[col+3]) || 0;

      superCatOut.gross_cost.accounts[year] += childOut.gross_cost.accounts[year];
      superCatOut.revenue.accounts[year] += childOut.revenue.accounts[year];
      superCatOut.gross_cost.budgets[year] += childOut.gross_cost.budgets[year];
      superCatOut.revenue.budgets[year] += childOut.revenue.budgets[year];
    } 
    superCatOut.children.push(childOut);

    out[superCat] = superCatOut;
    
    /* end code here */
    i++;
  }

  var data = [];
  for(o in out) {
    data.push(out[o]);
  }

  fs.writeFile(path.join('data.json'), JSON.stringify(data, null, 4), function () {
    console.log('done!');
  });
});

function get(column, row) {
  return data[row][column];
}

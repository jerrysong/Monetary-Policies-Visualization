import json

date_list = []
stock_list = []
bond_list = []
date_set = set()

with open('../data/sp500.csv') as f:
    for line in f:
        date, stock = line.rstrip().split(',')
        date_list.append(date)
        date_set.add(date)
        stock_list.append(float(stock))

with open('../data/bond.csv') as f:
    for line in f:
        date, bond = line.rstrip().split(',')
        if date not in date_set:
            continue
        else:
            bond_list.append(float(bond))

# The entries in each output dataset should be equal, even if entries number from the raw data are different.
assert len(date_list) == len(stock_list) == len(bond_list)
print "Process %d entries in total." % (len(date_list))

dict_data = {
    "xData": date_list,
    "datasets": [
        {"name": "S&P 500", "chart": "stock_chart", "data": stock_list, "unit": "", "type": "area", "valueDecimals": 0},
        {"name": "Bond", "chart": "bond_chart", "data": bond_list, "unit": "", "type": "area", "valueDecimals": 2}
    ]
}

with open('../data/stock_bond_data.json', 'w') as f:
    json.dump(dict_data, f)

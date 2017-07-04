date_list = []
index_list = []
with open('../data/Market_and_Economy/209FinalProject_DailyData.csv') as f:
    for line in f:
        date, index, _, _ = line.rstrip().split(',')
        if len(date) == 0:
            break
        else:
            date_list.append(date)
            index_list.append(float(index))

print index_list

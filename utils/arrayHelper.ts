class ArrayHelper {
    public groupByArray(data: any, key: any) {
      const groupedObj = data.reduce((prev: any, cur: any) => {
        if (!prev[cur[key]]) {
          prev[cur[key]] = [cur]
        } else {
          prev[cur[key]].push(cur)
        }
        return prev
      }, {})
      return Object.keys(groupedObj).map((Heading) => ({
        heading: Heading,
        list: groupedObj[Heading],
      }))
    }
  
    /** Hàm distinct array theo 1 trường nào đó */
    public filterArrayUniqueByFieldName(arr: any[], fieldName: string) {
      const lstValue = arr.map((c) => c[fieldName])
      return lstValue.filter((value, index, self) => self.indexOf(value) === index)
    }
  }
  
  export default new ArrayHelper()
  
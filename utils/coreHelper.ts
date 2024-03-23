// import { customAlphabet } from 'nanoid'
import moment from "moment";
import { millisecondInDay } from "../config/constant";
export interface TreeNode {
  title: string;
  key: string;
  code?: string;
  children?: TreeNode[];
  expanded?: boolean;
  checked?: boolean;
  selected?: boolean;
  isLeaf?: boolean;
}

export interface Action {
  name: string;
  code: string;
  value: boolean;
}

export interface GroupChild {
  code: string;
  name: string;
  [key: string]: Action | string;
}

export interface RoleGroup {
  id: number;
  name: string;
  code: string;
  children: GroupChild[];
}

class CoreHelper {
  /** Hàm gen code */
  // async genCodeDefault(data: string, isFinance = true) {
  //   const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 5)
  //   const genCode = `${data}-${nanoid()}`
  //   return genCode
  // }
  /** Get array từ obj */
  public convertObjToArray(obj: any) {
    const arr = [];
    // tslint:disable-next-line:forin
    for (const key in obj) {
      const value = obj[key];
      arr.push(value);
    }
    return arr;
  }

  generateCode(sequenceNumber: number, data: string): string {
    const currentDate = this.getCurrentDate();
    const generatedCode = `${data}_${currentDate}_${sequenceNumber}`;
    return generatedCode;
  }

  formatNumber(number: number): string {
    return number < 10 ? `0${number}` : `${number}`;
  }

  getCurrentDate(): string {
    const currentDate = new Date();
    const day = this.formatNumber(currentDate.getDate());
    const month = this.formatNumber(currentDate.getMonth() + 1);
    const year = currentDate.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /** Get array từ obj */
  public convertObjToArrayCodeName(obj: any) {
    const arr = [];
    // tslint:disable-next-line:forin
    for (const key in obj) {
      const value = obj[key];
      arr.push({ code: value.code, name: value.name });
    }
    return arr;
  }

  public newDateTZ() {
    const d = new Date();
    const offset = 7;
    // convert to msec
    // add local time zone offset
    // get UTC time in msec
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;

    // create new Date object for different city
    // using supplied offset
    const nd = new Date(utc + 3600000 * offset);
    return nd;
  }

  // public getDomain(req: IRequest) {
  //   const header: any = req?.headers
  //   let domain = header?.origin
  //   if (!domain) throw new UnauthorizedException('Không xác định domain truy cập! (code: REQUEST_DOMAIN_ERROR)')
  //   domain = domain.replace('http://', '').replace('https://', '')
  //   if (domain.includes('localhost')) domain = enumDomainReplace[domain]

  //   return domain
  // }

  public stringInject(str: string, data: any) {
    if (typeof str === "string" && data instanceof Array) {
      return str.replace(/({\d})/g, function (i: any) {
        return data[i.replace(/{/, "").replace(/}/, "")];
      });
    } else if (typeof str === "string" && data instanceof Object) {
      if (Object.keys(data).length === 0) {
        return str;
      }

      for (const key in data) {
        return str.replace(/({([^}]+)})/g, function (i) {
          const key = i.replace(/{/, "").replace(/}/, "");
          if (!data[key]) {
            return i;
          }

          return data[key];
        });
      }
    } else if (
      (typeof str === "string" && data instanceof Array === false) ||
      (typeof str === "string" && data instanceof Object === false)
    ) {
      return str;
    } else {
      return "";
    }
  }

  /**
   * Tự động gán prop có sẵn trong đối tượng chỉ định
   * @param data
   * @param target
   * @author NhatSang
   */
  public updatePropByDataKey(data: any, target: any) {
    for (const prop in target) {
      if (Object.prototype.hasOwnProperty.call(data, prop)) {
        // console.log(prop)
        target[prop] = data[prop];
      }
    }

    return target;
  }

  /** Tính số phút của hai ngày */
  public calculateMinutesBetweenTwoDate(dateFrom: Date, dateTo: Date) {
    const msInHour = 1000 * 60;
    const minutes = Math.round(
      Math.abs(new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / msInHour
    );

    return minutes;
  }

  /** Hàm tìm key trùng value */
  findDuplicates(arr: any[], key: string): string[] {
    const seen: { [key: string]: boolean } = {};
    const duplicates: string[] = [];
    var array = [];
    array = arr;
    for (const prop of array) {
      if (seen[prop[key]]) {
        if (!duplicates.includes(prop[key])) {
          duplicates.push(prop[key]);
        }
      } else {
        seen[prop[key]] = true;
      }
    }
    return duplicates;
  }

  /** Tính số giờ dự trên số phút */
  public convertMinutesToHours(minutes: number) {
    const hours = minutes / 60;
    const roundedHours = Math.floor(hours);
    const roundedMinutes = Math.round((hours - roundedHours) * 60);
    return `${roundedHours.toString().padStart(2, "0")}:${roundedMinutes
      .toString()
      .padStart(2, "0")}`;
  }

  /** Tính số giờ dự trên số phút */
  public convertMinutesToHoursDecimal(minutes: number) {
    var minutes = 150; // Số phút cần chuyển đổi
    var hours = Math.floor(minutes / 60); // Số giờ nguyên
    var decimalHours = hours + (minutes % 60) / 60; // Số giờ dạng thập phân
    return decimalHours;
  }

  getISOWeekNumber(date: Date): number {
    const dt = new Date(date);
    dt.setHours(0, 0, 0, 0);

    // Set to Monday of the week
    dt.setDate(dt.getDate() + 4 - (dt.getDay() || 7));

    // Get the year of the week
    const yearStart = new Date(dt.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((dt.getTime() - yearStart.getTime()) / millisecondInDay + 1) / 7);

    return weekNumber;
  }
  formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const formattedDay = day < 10 ? "0" + day : day;
    const formattedMonth = month < 10 ? "0" + month : month;

    return formattedDay + "/" + formattedMonth + "/" + year;
  }

  genEnumMultiLevelToArray(enumData: object) {
    const res = [];
    let lstEnum = this.convertObjToArray(enumData);

    for (const e of lstEnum) {
      res.push(e);
      if (e.child || e.children) {
        const lstChildren: any = this.genEnumMultiLevelToArray(e.child || e.children);
        for (const c of lstChildren) {
          c.parent = e;
          res.push(c);
        }
      }
    }
    return res;
  }

  // Convert RoleGroup to Role have each key instead of each module
  getEnumMultiLevelToArray(enumData: Object) {
    const enumObj = {};

    for (const key in enumData) {
      if (Object.prototype.hasOwnProperty.call(enumData, key)) {
        const element = enumData[key];
        const children = element.children;

        for (const enumItem of children) {
          const objectKey = enumItem.code;
          const objectValue = enumItem;
          enumObj[objectKey] = objectValue;
        }
      }
    }

    return enumObj;
  }

  convertResModulePermissionToArray(listPermissionJSONRes: any) {
    const result = listPermissionJSONRes.map((item) => item[0]);
    return result;
  }

  stringToDate(dateString: string) {
    const parts = dateString.split("/");
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Giá trị tháng trong đối tượng Date là từ 0 đến 11
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  /** Lấy 1 arr gồm 1 trường data không trùng */
  selectDistinct(arr: any[], field: string) {
    if (!arr?.length) return [];
    const set = new Set<string>();
    for (const item of arr) if (item[field]) set.add(item[field]);
    return [...set];
  }

  convertToTreeNodes(roleGroups: { [key: string]: RoleGroup }): TreeNode[][] {
    const result: TreeNode[][] = [];

    Object.keys(roleGroups).forEach((groupKey) => {
      const group = roleGroups[groupKey];
      const groupNode: TreeNode = {
        title: group.name,
        code: group.code, // Add code for the parent root node!
        key: `${group.id}`,
        children: [],
        expanded: true, // Assuming you want the group nodes to be initially expanded
      };

      group.children.forEach((child, index) => {
        const childNode: TreeNode = {
          title: child.name,
          key: `${group.id}-${index}`,
          children: [],
          expanded: true, // Child nodes are not expanded by default
        };

        Object.keys(child).forEach((actionKey) => {
          if (typeof child[actionKey] === "object") {
            const action = child[actionKey] as Action;
            childNode.children?.push({
              title: action.name,
              key: action.code,
              isLeaf: true,
              checked: action.value,
              selected: action.value, // Assuming the 'selected' state is determined by 'value'
            });
          }
        });

        if (childNode.children.length > 0) {
          groupNode.children?.push(childNode);
        }
      });

      if (groupNode.children.length > 0) {
        result.push([groupNode]);
      }
    });

    return result;
  }

  async getCodeDefault(prefixCode: string, schemaObj: any) {
    const code = prefixCode + "_" + moment(new Date()).format("MMYYYY") + "_";
    const objData = await schemaObj
      .findOne({
        code: { $regex: code, $options: "i" }, // Case-insensitive like
      })
      .sort({ code: -1 }); // Descending order by 'code'

    let sortString = "0";
    if (objData) {
      sortString = objData.code.substring(code.length, code.length + 4);
    }
    const lastSort = parseInt(sortString);
    sortString = ("000" + (lastSort + 1)).slice(-4);

    return code + sortString;
  }
}

export const coreHelper = new CoreHelper();

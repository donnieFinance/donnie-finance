import moment from 'moment-timezone'
import XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ComUtil from '~/util/ComUtil';

const ExcelUtil = {
    s2ab(s) {
        var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
        var view = new Uint8Array(buf);  //create uint8array as viewer
        for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
        return buf;
    },

    //기존 ezfarm ExcelDownload 대용으로 사용.
    download: function(fileName, excelData){
        //console.log('download Headers', excelData[0].columns)
        //console.log('download data', excelData[0].data)

        // let data = ComUtil.objectAssign(excelData[0].data)
        let data = excelData[0].data
        this.downloadForAoa(fileName, excelData[0].columns, data );
    },

    downloadForAoa: function(fileName, headers, data){

        // workbook 생성
        let wb = XLSX.utils.book_new();

        // 시트 만들기
        let v_SheetName = "sheet1";

        if(headers) data.unshift(headers);

        // aoa 데이터 삽입
        let ws = XLSX.utils.aoa_to_sheet(data);

        // workbook에 새로만든 워크시트에 이름을 주고 붙인다.
        XLSX.utils.book_append_sheet(wb, ws, v_SheetName);

        // 엑셀 파일 만들기
        let wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'array'});

        // 엑셀 파일 내보내기
        const v_momentDate = moment().toDate();
        const currentDate = moment(v_momentDate).format("YYYYMMDDHHmmss");
        let v_ExcelFileName = fileName + "_" + currentDate + ".xlsx";
        saveAs(new Blob([wbout],{type:"application/octet-stream"}), v_ExcelFileName);
    },
    downloadForJson: function(fileName, headers, columns, data){
        //let v_order_data_list = this.state.data;

        // step 1. workbook 생성
        let wb = XLSX.utils.book_new();

        // step 2. 시트 만들기
        let v_SheetName = "sheet1";

        let Heading = [];   //[["Employee Details"],["Emp Name", "Emp Sal"]];
        let Data = [];      //[{name:"xyz", sal:1000}, {name:"abc", sal:2000}];
        if(headers){
            Heading = [headers];
        }

        let Columns = [];//["sal", "name"]
        if(columns){
            Columns = columns;
        }

        if(data){
            Data = data;
        }

        let ws = XLSX.utils.aoa_to_sheet(Heading);

        // append to bottom of worksheet starting on first column
        let v_origin_position = "A1";
        if(Heading.length === 1){
            v_origin_position = "A2";
        } else if(Heading.length > 1){
            v_origin_position = -1;
        }

        // json 데이터 삽입
        XLSX.utils.sheet_add_json(ws, Data, {
            header:Columns,
            skipHeader:true,
            origin:v_origin_position
        });

        // step 3. workbook에 새로만든 워크시트에 이름을 주고 붙인다.
        XLSX.utils.book_append_sheet(wb, ws, v_SheetName);

        // step 4. 엑셀 파일 만들기
        let wbout = XLSX.write(wb, {bookType:'xlsx', type: 'array'});

        // step 5. 엑셀 파일 내보내기
        const v_momentDate = moment().toDate();
        const currentDate = moment(v_momentDate).format("YYYYMMDDHHmmss");
        let v_ExcelFileName = fileName + "_" + currentDate + ".xlsx";
        saveAs(new Blob([wbout],{type:"application/octet-stream"}), v_ExcelFileName);
    },
    excelExportJson: function(file, callback) {
        var reader = new FileReader();
        reader.onload = function(evt){
            if (evt.target.readyState == FileReader.DONE) {
                var fileData = reader.result;
                var wb = XLSX.read(fileData, {type: 'binary'});
                var sheetNameList = wb.SheetNames; // 시트 이름 목록 가져오기
                var firstSheetName = sheetNameList[0]; // 첫번째 시트명
                var firstSheet = wb.Sheets[firstSheetName]; // 첫번째 시트
                var jsonData = XLSX.utils.sheet_to_json(firstSheet, {header: 0, defval: ""});
                callback(jsonData);
            }
        };
        reader.readAsBinaryString(file);
    }
}

export default ExcelUtil
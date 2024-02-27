export const exportVisitPdf = (ar: any, start: any, end: any) => {
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    var doc = new jsPDF();
    doc.addImage("./public/src/assets/pictures/report.png", "PNG", 10, 10, 30, 10);
    doc.setDrawColor(0, 0, 128);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 128);
    doc.setFontSize(25);
    doc.text(10, 30, `Visitas`);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'italic');
    doc.text(135, 30, `Fecha: Desde ${start} Hasta ${end}`);
    //construimos cabecera del csv
    doc.setFont(undefined, 'bold');
    doc.line(5, 34.8, 205, 34.8);
    doc.setFillColor(210, 210, 210);
    doc.rect(5, 35, 200, 10, 'F');
    doc.text(10, 40, "Nombre");
    doc.text(60, 40, "DNI");
    doc.text(90, 40, "Fecha");
    doc.text(110, 40, "Hora");
    doc.text(130, 40, "Usuario");
    doc.text(180, 40, "Estado");;
    doc.line(5, 45, 205, 45);
    let row = 50;
    let pagina = 1;
    doc.setTextColor(0, 0, 128);
    doc.text(10, 290, `Página ${pagina}`);
    //resto del contenido
    for (let i = 0; i < ar.length; i++) {
        let visit = ar[i];
        let rowName1 = 0;
        let rowName2 = 0;
        // @ts-ignore
        //if (visit.creationDate >= start && visit.creationDate <= end) {
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(10, row, splitText(doc, `${visit?.firstName ?? ''} ${visit?.firstLastName ?? ''} ${visit?.secondLastName ?? ''}`, 10, 5, 60));
            doc.text(60, row, `${visit.dni}`);
            doc.text(90, row, `${visit.creationDate}`);
            doc.text(110, row, `${visit.creationTime}`);
            doc.text(130, row, splitText(doc, `${visit.user?.firstName ?? ''} ${visit.user?.lastName ?? ''}`, 130, 5, 180));
            doc.text(180, row, `${visit.visitState?.name ?? ''}`);

            rowName1 = calculateRow(`${visit?.firstName ?? ''} ${visit?.firstLastName ?? ''} ${visit?.secondLastName ?? ''}`.length,"nombre");
            rowName2 = calculateRow(`${visit.user?.firstName ?? ''} ${visit.user?.lastName ?? ''}`.length,"nombre");
            rowName1 > rowName2 ? row += rowName1 : row += rowName2
            
            doc.setDrawColor(210, 210, 210);
            doc.line(5, row, 205, row);
            if ((row+newDataBlock(ar,i)) > 280) {
                doc.addPage();
                row = 30;
                pagina += 1;
                doc.setFontSize(10);
                doc.setFont(undefined, 'italic');
                doc.text(135, 10, `Fecha: Desde ${start} Hasta ${end}`);
                doc.setFont(undefined, 'bold');
                //construimos cabecera del csv
                doc.setDrawColor(0, 0, 128);
                doc.line(5, 15, 205, 15);
                doc.setFillColor(210, 210, 210);
                doc.rect(5, 15, 200, 10, 'F');
                doc.text(10, 20, "Nombre");
                doc.text(60, 20, "DNI");
                doc.text(90, 20, "Fecha");
                doc.text(110, 20, "Hora");
                doc.text(130, 20, "Usuario");
                doc.text(180, 20, "Estado");
                doc.line(5, 25, 205, 25);
                doc.setTextColor(0, 0, 128);
                doc.text(10, 290, `Página ${pagina}`);
            }else{
                row += 5;
            }
        //}
    }
    // Save the PDF
    var d = new Date();
    var title = "log_Visitas_" + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + `.pdf`;
    doc.save(title);
}

export const exportVisitCsv = (ar: any, start: any, end: any) => {
    let rows = [];
    for(let i=0; i < ar.length; i++){
        let visit = ar[i]
        // @ts-ignore
        //if(visit.creationDate >= start && visit.creationDate <= end){
            let obj = {
                "Nombre": `${visit.firstName} ${visit.firstLastName} ${visit.secondLastName}`,
                "DNI": `${visit.dni}`,
                "Fecha Creación": `${visit.creationDate}`,
                "Hora Creación": `${visit.creationTime}`,
                "Usuario": `${visit.user?.firstName ?? ''} ${visit.user?.lastName ?? ''}`,
                "Tipo": `${verifyUserType(visit.user.userType)}`,
                "Departamento": `${visit.department?.name ?? ''}`,
                "Estado": `${visit.visitState?.name ?? ''}`,
                "Verificado": `${visit.verifiedDocument ? 'Si' : 'No'}`,
                "Favorita": `${visit.favorite ? 'Si' : 'No'}`,
                "Teléfono": `${visit?.phoneNumber ?? ''}`,
                "Autorizado": `${visit?.authorizer ?? ''}`,
                "Fecha Ingreso": `${visit.ingressDate}`,
                "Hora Ingreso": `${visit.ingressTime}`,
                "Emitido Ingreso": `${visit.ingressIssuedId?.firstName ?? ''} ${visit.ingressIssuedId?.lastName ?? ''}`,
                "Fecha Salida": `${visit?.egressDate ?? ''}`,
                "Hora Salida": `${visit?.egressTime ?? ''}`,
                "Emitido Salida": `${visit.egressIssuedId?.firstName ?? ''} ${visit.egressIssuedId?.lastName ?? ''}`,
                "Asunto": `${visit.reason.split("\n").join("(salto)")}`,
              }
              rows.push(obj);
        //}
        
    }
    generateFile(rows, "Visitas", "csv");
}

export const exportVisitXls = (ar: any, start: any, end: any) => {
    let rows = [];
    for(let i=0; i < ar.length; i++){
        let visit = ar[i]
        // @ts-ignore
        //if(visit.creationDate >= start && visit.creationDate <= end){
            let obj = {
                "Nombre": `${visit.firstName} ${visit.firstLastName} ${visit.secondLastName}`,
                "DNI": `${visit.dni}`,
                "Fecha Creación": `${visit.creationDate}`,
                "Hora Creación": `${visit.creationTime}`,
                "Usuario": `${visit.user?.firstName ?? ''} ${visit.user?.lastName ?? ''}`,
                "Tipo": `${verifyUserType(visit.user.userType)}`,
                "Departamento": `${visit.department?.name ?? ''}`,
                "Estado": `${visit.visitState?.name ?? ''}`,
                "Verificado": `${visit.verifiedDocument ? 'Si' : 'No'}`,
                "Favorita": `${visit.favorite ? 'Si' : 'No'}`,
                "Teléfono": `${visit?.phoneNumber ?? ''}`,
                "Autorizado": `${visit?.authorizer ?? ''}`,
                "Fecha Ingreso": `${visit.ingressDate}`,
                "Hora Ingreso": `${visit.ingressTime}`,
                "Emitido Ingreso": `${visit.ingressIssuedId?.firstName ?? ''} ${visit.ingressIssuedId?.lastName ?? ''}`,
                "Fecha Salida": `${visit?.egressDate ?? ''}`,
                "Hora Salida": `${visit?.egressTime ?? ''}`,
                "Emitido Salida": `${visit.egressIssuedId?.firstName ?? ''} ${visit.egressIssuedId?.lastName ?? ''}`,
                "Asunto": `${visit.reason.split("\n").join("(salto)")}`,
              }
              rows.push(obj);
        //}
        
    }
    generateFile(rows, "Visitas", "xls");
}

const generateFile = (ar: any, title: string, extension: string) => {
    //comprobamos compatibilidad
    if(window.Blob && (window.URL || window.webkitURL)){
        var contenido = "",
          d = new Date(),
          blob,
          reader,
          save,
          clicEvent;
        //creamos contenido del archivo
        for (var i = 0; i < ar.length; i++) {
          //construimos cabecera del csv
          if (i == 0)
            contenido += Object.keys(ar[i]).join(";") + "\n";
          //resto del contenido
          contenido += Object.keys(ar[i]).map(function(key){
                  return ar[i][key];
                }).join(";") + "\n";
        }
        //creamos el blob
        blob =  new Blob(["\ufeff", contenido], {type: `text/${extension}`});
        //creamos el reader
        // @ts-ignore
        var reader = new FileReader();
        reader.onload = function (event) {
          //escuchamos su evento load y creamos un enlace en dom
          save = document.createElement('a');
          // @ts-ignore
          save.href = event.target.result;
          save.target = '_blank';
          //aquí le damos nombre al archivo
          save.download = "log_"+title+"_"+ d.getDate() + "_" + (d.getMonth()+1) + "_" + d.getFullYear() +`.${extension}`;
          try {
            //creamos un evento click
            clicEvent = new MouseEvent('click', {
              'view': window,
              'bubbles': true,
              'cancelable': true
            });
          } catch (e) {
            //si llega aquí es que probablemente implemente la forma antigua de crear un enlace
            clicEvent = document.createEvent("MouseEvent");
            // @ts-ignore
            clicEvent.click();
          }
          //disparamos el evento
          save.dispatchEvent(clicEvent);
          //liberamos el objeto window.URL
          (window.URL || window.webkitURL).revokeObjectURL(save.href);
        }
        //leemos como url
        reader.readAsDataURL(blob);
      }else {
        //el navegador no admite esta opción
        alert("Su navegador no permite esta acción");
      }

}

const verifyUserType = (userType: string) =>{
    if(userType == 'CUSTOMER'){
      return 'Cliente'
    }else if(userType == 'GUARD'){
      return 'Guardia'
    }else if(userType == 'EMPLOYEE'){
      return 'Empleado'
    }else if(userType == 'CONTRACTOR'){
      return 'Contratista'
    }else{
      return userType
    }
}

const calculateRow = (length: any, mode: any) => {
  let row = 0;
  let limit = 0; // limite de lineas
  if(mode=="parrafo"){
      limit = 47;
  }else if(mode=="nombre"){
      limit = 30;
  }
  let lineCount = Math.ceil(length / limit);
  for(let i = 1; i <= lineCount; i++){
      if(length <= (limit * i)){  //124 caracteres cada linea aprox en total margen A4
          row += (4*i);
      }
  }
  return row;
}

const newDataBlock = (array: any, index: any) => {
  let row = 0;
  if(array[index+1] != undefined){
      row+=5;
      let rowName1 = calculateRow(`${array[index+1]?.firstName ?? ''} ${array[index+1]?.firstLastName ?? ''} ${array[index+1]?.secondLastName ?? ''}`.length,"nombre");
      let rowName2 = calculateRow(`${array[index+1]?.user?.firstName ?? ''} ${array[index+1]?.user?.lastName ?? ''}`.length,"nombre");
      rowName1 > rowName2 ? row += rowName1 : row += rowName2;
  }
  return row;
}

const splitText = (doc: any, field: any, lMargin: any, rMargin: any, pdfInMM: any) => {
  return doc.splitTextToSize(field, (pdfInMM - lMargin - rMargin));
}
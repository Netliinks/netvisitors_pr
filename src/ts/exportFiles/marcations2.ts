export const exportMarcationsPdf = (ar: any, start: any, end: any) => {
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    var doc = new jsPDF()
    doc.addImage("./public/src/assets/pictures/report.png", "PNG", 10, 10, 50, 15)
    doc.setDrawColor(0, 0, 128);
    doc.setFont(undefined, 'bold')
    doc.setTextColor(0,0,128)
    doc.setFontSize(25)
    doc.text(10, 40, `Gestión Marcaciones`)
    doc.setFontSize(10)
    doc.setTextColor(0,0,0)
    doc.setFont(undefined, 'italic')
    doc.text(130, 40, `Fecha: Desde ${start} Hasta ${end}`)
    //construimos cabecera del csv
    doc.setFont(undefined, 'bold')
    doc.line(5, 45, 200, 45);
    doc.setFillColor(210,210,210)
    doc.rect(5, 45, 195, 10, 'F')
    doc.text(10, 50, "Nombre");
    doc.text(50, 50, "DNI");
    doc.text(90, 50, "Fecha");
    doc.text(120, 50, "Primera Marcación");
    doc.text(160, 50, "última Marcación"); 
    doc.line(5, 55, 200, 55);
    
    let row = 60
    let lineas = 0
    let pagina = 1
    doc.setTextColor(0,0,128)
    doc.text(10, 290, `Página ${pagina}`)
    //resto del contenido
    for (let i = 0; i < ar.length; i++) {
        let marcation = ar[i]
        // @ts-ignore
        //if(marcation.ingressDate >= start && marcation.ingressDate <= end){
            doc.setFontSize(9)
            doc.setFont(undefined, 'normal')
            doc.setTextColor(0,0,0)
            doc.text(10, row, `${marcation?.firstName ?? ''} ${marcation?.lastName ?? ''}`);
            doc.text(50, row, `${marcation?.dni ?? ''}`);
            doc.text(90, row, `${marcation.ingressDate}`);
            doc.text(120, row, `${marcation.ingressTime}`);
            doc.text(160, row, `${marcation?.egressTime ?? ''}`);
            row += 5
            let limitLineas = 51
            if(pagina == 1) limitLineas = 44
            if(lineas >= limitLineas){ 
                
                doc.addPage()
                lineas=0
                row = 30
                pagina+=1
                doc.setFont(undefined, 'bold')
                doc.setFontSize(10)
                //construimos cabecera del csv
                doc.line(5, 15, 200, 15)
                doc.setFillColor(210,210,210);
                doc.rect(5, 15, 195, 10, 'F');
                doc.text(10, 20, "Nombre");
                doc.text(50, 20, "DNI");
                doc.text(90, 20, "Fecha");
                doc.text(120, 20, "Primera Marcación");
                doc.text(160, 20, "última Marcación");  
                doc.line(5, 25, 200, 25);
                doc.setTextColor(0,0,128)
                doc.text(10, 290, `Página ${pagina}`)
            }
            lineas++
        //}

    }
    // Save the PDF
    var d = new Date()
    var title = "log_GestMarc_"+ d.getDate() + "_" + (d.getMonth()+1) + "_" + d.getFullYear() +`.pdf`;
    doc.save(title);

}

export const exportMarcationsCsv = (ar: any, start: any, end: any) => {
    let rows = [];
    for(let i=0; i < ar.length; i++){
        let marcation = ar[i]
        // @ts-ignore
        //if(marcation.ingressDate >= start && marcation.ingressDate <= end){
            let obj = {
                "DNI": `${marcation?.dni ?? ''}`,
                "Usuario": `${marcation?.firstName ?? ''} ${marcation?.lastName ?? ''}`,
                "Fecha": `${marcation.ingressDate}`,
                "Primera Marcación": `${marcation.ingressTime}`,
                "última Marcación": `${marcation?.egressTime ?? ''}`,
              }
              rows.push(obj);
        //}
        
    }
    generateFile(rows, "GestMarc", "csv");
}

export const exportMarcationsXls = (ar: any, start: any, end: any) => {
    let rows = [];
    for(let i=0; i < ar.length; i++){
        let marcation = ar[i]
        // @ts-ignore
        //if(marcation.ingressDate >= start && marcation.ingressDate <= end){
            let obj = {
                "DNI": `${marcation?.dni ?? ''}`,
                "Usuario": `${marcation?.firstName ?? ''} ${marcation?.lastName ?? ''}`,
                "Fecha": `${marcation.ingressDate}`,
                "Primera Marcación": `${marcation.ingressTime}`,
                "última Marcación": `${marcation?.egressTime ?? ''}`,
              }
              rows.push(obj);
        //}
        
    }
    generateFile(rows, "GestMarc", "xls");
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
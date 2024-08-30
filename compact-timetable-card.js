class Row {
  constructor(dep1, dep2) {
    this.rowElem = document.createElement("TR");
    this.data1 = new Data(dep1);
    this.data2 = new Data(dep2);

    this.rowElem.innerHTML = `
      ${this.data1.dataEString}
      ${this.data2.dataEString}
    `;
  }
}

class Data {
  dataEString
  constructor(dep) {
    this.dep = dep;
    const delayM = this.getDelayM();
    const routeSplit = this.dep.route.split(" ");
    const routeNumber = routeSplit[routeSplit.length - 1]
    this.dataEString = `
      <td>
        <div class="routeContainer">
          <div class="route" style="background-color: ${this.getRouteColour()};">
            ${routeNumber}
          </div>
          <div class="direction"> 
            ${this.dep.direction}
          </div>
        </div>
        <div class="timeContainer">
          <div class="time">
            ${this.dep.scheduled_at.split(" ")[1]}
          </div>
          <div class="delay" style="width: ${delayM ? "auto" : "0"};">
            +${delayM}
          </div>
        </div>
      </td>
    `;
  }

  getDelayM() {
    const timeSplit = this.dep.scheduled_at.split(" ")[1].split(":");
    const delaySplit = this.dep.due_at.split(" ")[1].split(":");
    const delayHDiff = delaySplit[0] - timeSplit[0];
    const delayMDiff = delaySplit[1] - timeSplit[1];
    
    let delayM = 0;
    
    if (!delayHDiff) {
      delayM = delayMDiff;
    }
    else if (delayHDiff > 0) {
      delayM = delayMDiff + delayHDiff * 60;
    }
    
    return delayM;
  }

  getRouteColour() {
    switch (this.dep.type) {
      case "BUS":
        switch (this.dep.route.split(" ")[0]) {
          case "Bus":
            // Regionalbus (Blå)
            return "#007ac2";
          
          case "Bybus":
            if (this.dep.route.includes("A")) {
              // A-bybus (Rød)
              return "#b8211c";
            }
            else {
              // Bybus (Gul)
              return "#fdae00";
            }
          }
        break;
      
      case "EXB":
        // X-bus (Blå)
        return "#007ac2";
      
      case "NB":
        // Natbus (Mørkeblå)
        return "#013e5a";
      
      case "TOG":
        if (this.dep.route.includes("Togbus")) {
          switch (this.dep.route.split(" ")[1]) {
            case "RØD":
              // Rød togbus (Rød)
              return "#E83F11";
            
            case "GRØN": 
              // Grøn togbus (grøn)
              return "#47A440";
          }
        } 

        // Ukendt tog (Hvid)???
        return "#ffffff";
      
      case "IC":
        // Intercity tog (Rød?)
        return "#EF4130";
      
      case "REG":
        // Regionaltog (Grøn)
        return "#50B748";
      
      case "LET":
        // // Letbane (Mørkeblå)
        // return "#254A5D";
        // Letbane (Letbane-rød - ikke rejseplanen standard)
        return "#C5003D";
    }

    // Ukendt (Hvid)
    return "#ffffff";
  }
}

class CompactTimetableCard extends HTMLElement {
  // Whenever the state changes, a new `hass` object is set. Use this to
  // update your content.
  set hass(hass) {
    // Initialize the content if it's not there yet.
    if (/*!this.content*/true) {
      const depState = hass.states[this.config.entity];

      // Create first row (first row is special)
      const firstRow = new Row(depState.attributes, depState.attributes.next_departures[0]);

      let insertHtml = `<tr style="padding-top: 0;">${firstRow.rowElem.innerHTML}</tr>`;

      // Create the rest of the rows
      for (let i = 1; i < (this.config.rows > 10 ? 10 : this.config.rows); i++) {
        const row = new Row(depState.attributes.next_departures[i * 2 - 1], depState.attributes.next_departures[i * 2]);
        insertHtml += `<tr>${row.rowElem.innerHTML}</tr>`;
      }

      this.innerHTML = `
        <style>
          table {
            width: 100%;
          }

          tr {
            width: 100%;
            display: flex;
            flex-wrap: nowrap;
            padding-top: 2px;
          }

          td {
            display: flex;
            justify-content: space-between;
            width: 50%;
            font-size: 18px;
            font-weight: 500;
            padding: 0;
          }

          .routeContainer {
            display: flex;
          }

          .route {
            background-color: green;
            width: auto;
            padding: 2px;
            margin-right: 2px;
            border-radius: 3px;
          }

          .direction {
            align-self: center;
            font-weight: 200;
            font-size: 12px;
            line-height: 12px;
          }

          .timeContainer {
            display: flex;
            justify-content: flex-end;
            margin-right: 2px;
            align-self: center;
          }

          .time {
          }

          .delay {
            width: 10px;
            overflow: hidden;
            color: #ED4E4E;
          }
        </style>
        <ha-card header="">
          <div class="card-content">
            <table>
              ${insertHtml}
            </table>
          </div>
        </ha-card>
      `;

      this.content = this.querySelector('div');
    }
  }

  // The user supplied configuration. Throw an exception and Home Assistant
  // will render an error card.
  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return 3;
  }
}

customElements.define('compact-timetable-card', CompactTimetableCard);
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
    this.dataEString = `
      <td>
        <div class="routeContainer">
          <div class="route" style="background-color: ${this.getRouteColour()};">
            ${this.dep.route.split(" ")[1]}
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
        return "#04a4f1";
      
      case "NB":
        return "#013e5a";
    }

    return "#ffffff";
  }
}

class CompactTimetable extends HTMLElement {
  // Whenever the state changes, a new `hass` object is set. Use this to
  // update your content.
  set hass(hass) {
    // Initialize the content if it's not there yet.
    console.log(this.content);
    if (!this.content) {
      const depState = hass.states[this.config.entity];

      // Create first row (first row is special)
      const firstRow = new Row(depState.attributes, depState.attributes.next_departures[0]);

      let insertHtml = `<tr style="padding-top: 0;">${firstRow.rowElem.innerHTML}</tr>`;

      // Create the rest of the rows
      for (let i = 1; i < this.config.rows; i++) {
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
          <div class="card-content" style="padding:0;">
            <table>
              ${insertHtml}
            </table>
          </div>
        </ha-card>
      `;

      this.content = this.querySelector('div');
    }

    // const entityId = this.config.entity;
    // const rows = this.config.rows;
    // const state = hass.states[entityId];
    // const stateStr = state ? state.state : 'unavailable';

    // if (stateStr == "unavailable") {
    //   return;
    // }

    // const timeSplit = state.attributes.scheduled_at.split(" ")[1].split(":");
    // const delaySplit = state.attributes.due_at.split(" ")[1].split(":");
    // const delayHDiff = delaySplit[0] - timeSplit[0];
    // const delayMDiff = delaySplit[1] - timeSplit[1];
    // let delayM;
    // let delayWidth = "auto";
    // if (!delayHDiff) {
    //   delayM = delayMDiff;
    // }
    // else if (delayHDiff > 0) {
    //   delayM = delayMDiff + delayHDiff * 60;
    // }
    // if (delayM == 0) {
    //   delayWidth = "0";
    // }

    // const type = state.attributes.type;
    // let routeColour;
    // if (type === "BUS") {
    //   routeColour = "#04a4f1";
    // }
    // else if (type === "NB") {
    //   routeColour = "#013e5a";
    // }
    // else {
    //   routeColour = "#ffffff";
    // }

    // this.content.innerHTML = `
    //   <style>
    //     table {
    //       width: 100%;
    //     }

    //     tr {
    //       width: 100%;
    //       display: flex;
    //       flex-wrap: nowrap;
    //     }

    //     td {
    //       display: flex;
    //       justify-content: space-between;
    //       width: 50%;
    //       font-size: 18px;
    //       font-weight: 500;
    //       padding: 0;
    //     }

    //     .routeContainer {
    //       display: flex;
    //     }

    //     .route {
    //       background-color: ${routeColour};
    //       width: auto;
    //       padding: 2px;
    //       margin-right: 2px;
    //       border-radius: 3px;
    //     }

    //     .direction {
    //       align-self: center;
    //       font-weight: 200;
    //       font-size: 12px;
    //       line-height: 12px;
    //     }

    //     .timeContainer {
    //       display: flex;
    //       justify-content: flex-end;
    //       margin-right: 2px;
    //       align-self: center;
    //     }

    //     .time {
    //     }

    //     .delay {
    //       width: ${delayWidth};
    //       overflow: hidden;
    //       color: #ED4E4E;
    //     }
    //   </style>
    //   <table>
    //     <tr>
    //       <td>
    //         <div class="routeContainer">
    //           <div class="route">
    //             ${state.attributes.route.split(" ")[1]}
    //           </div>
    //           <div class="direction"> 
    //             ${state.attributes.direction}
    //           </div>
    //         </div>
    //         <div class="timeContainer">
    //           <div class="time">
    //             ${state.attributes.scheduled_at.split(" ")[1]}
    //           </div>
    //           <div class="delay">
    //             +${delayM}
    //           </div>
    //         </div>
    //       </td>
    //       <td>
    //         <div class="route">
    //         </div>
    //         <div class="direction"> 
    //           ${state.attributes.next_departures[0].direction}
    //         </div>
    //         <div class="time">
    //         </div>
    //         <div class="delay">
    //         </div>
    //       </td>
    //     </tr>
    //   </table>
    //   `;
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

customElements.define('compact-timetable', CompactTimetable);
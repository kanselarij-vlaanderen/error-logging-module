const moment = require('moment');
const { uuid } = require('uuidv4');

module.exports = class Monitoring {
  setServiceName(serviceName) {
    this.serviceName = serviceName;
  }

  getServiceName() {
    return this.serviceName;
  }

  setGraph(graph) {
    this.graph = graph;
  }

  getGraph() {
   return this.graph;
  }

  logSuccess(data) {
    const {state, type } = data;
    const successObject = {
      success: true,
      unixTimestamp: moment().unix(),
      state,
      serviceName: this.getServiceName(),
      type
    };

    return this.successQuery(successObject,this.getGraph())
  };

  logError(data) {
    const {type, state, message, error } = data;
    const errorObject =  {
      success: false,
      type,
      timestamp: moment().unix(),
      state,
      serviceName:this.getServiceName(),
      message,
      error
    };
    return this.errorQuery(errorObject,this.getGraph());
  };

  successQuery(data, graph) {
    const newUUID = uuid();
    const newURI = `http://mu.semte.ch/vocabularies/ext/success/${newUUID}`;

    let insertData = `
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

    INSERT DATA {
        GRAPH <${graph}> {
             <${newURI}> a ext:Success ;
                           mu:uuid "${newUUID}" ;
                           ext:type ${data.type};
                           ext:serviceName ${data.serviceName};
                           ext:unixTimestamp ${data.unixTimestamp};
                           ext:state ${data.state} .       
        }
    }
  `;
    return insertData;
  };

  errorQuery(data, graph) {
    const newUUID = uuid();
    const newURI = `http://mu.semte.ch/vocabularies/ext/error/${newUUID}`;

    let insertData = `
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  
    INSERT DATA {
      GRAPH <${graph}> {
        <${newURI} a ext:Error;
                   mu:uuid ${newUUID};
                   ext:type ${data.type};
                   ext:serviceName ${data.serviceName};
                   ext:unixTimestamp ${data.unixTimestamp};
                   ext:state ${data.state} ;
                   ext:error ${data.error} .
      }
    }
  `;
    return insertData;
  };
}

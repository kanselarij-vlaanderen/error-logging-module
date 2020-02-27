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

  createLogEntry(data) {
    const {state, type } = data;
    const log = {
      unixTimestamp: moment().unix(),
      state,
      serviceName: this.getServiceName(),
      type
    };

    return this.createLogQuery(log,this.getGraph())
  };

  createErrorEntry(data) {
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
    return this.createErrorQuery(errorObject,this.getGraph());
  };

  createLogQuery(data, graph) {
    const newUUID = uuid();
    const newURI = `http://mu.semte.ch/vocabularies/ext/logs/${newUUID}`;

    let insertData = `
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

    INSERT DATA {
        GRAPH <${graph}> {
             <${newURI}> a ext:Success ;
                           mu:uuid "${newUUID}" ;
                           ext:type "${data.type}";
                           ext:serviceName "${data.serviceName}";
                           ext:unixTimestamp "${data.unixTimestamp}";
                           ext:state "${data.state}" .       
        }
    }
  `;
    return insertData;
  };

  createErrorQuery(data, graph) {
    const newUUID = uuid();
    const newURI = `http://mu.semte.ch/vocabularies/ext/error/${newUUID}`;

    let insertData = `
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  
    INSERT DATA {
      GRAPH <${graph}> {
        <${newURI} a ext:Error;
                   mu:uuid "${newUUID}";
                   ext:type "${data.type}";
                   ext:serviceName "${data.serviceName}";
                   ext:unixTimestamp "${data.unixTimestamp}";
                   ext:state "${data.state}" ;
                   ext:error "${data.error}" .
      }
    }
  `;
    return insertData;
  };
};

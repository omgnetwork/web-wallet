import axios from 'axios';
import config from 'util/config';

class TransportService {
  constructor () {
    this.baseUrl = config.watcherUrl;
    this.instance = axios.create({
      timeout: 20000,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async post ({ url, data, headers }) {
    const res = await this.instance({
      method: 'post',
      url: `${this.baseUrl}${url}`,
      ...headers ? { headers } : {},
      ...data ? { data } : {}
    });
    const result = {
      ...res,
      response: res.data
    }
    delete result['data']
    return result;
  }
}

const transportService = new TransportService();
export default transportService;

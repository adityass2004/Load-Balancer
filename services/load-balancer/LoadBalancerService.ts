import { ServerSelector } from './ServerSelector';
import { RequestForwarder } from './RequestForwarder';
import { MetricsCollector } from './MetricsCollector';
import { RetryService } from './RetryService';
import { LoadBalancer } from './LoadBalancer';

const selector = new ServerSelector();
const forwarder = new RequestForwarder();
const metrics = new MetricsCollector();
const retryService = new RetryService(selector, forwarder, metrics);
const loadBalancer = new LoadBalancer(retryService);

export const loadBalancerService = {
  async handleRequest(request: Request): Promise<Response> {
    return loadBalancer.handleRequest(request);
  },
};

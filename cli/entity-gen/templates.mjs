export const templates = {
  'hooks/get': ({ singular, plural }) =>
    `
        import { queryOptions, useInfiniteQuery, useQuery } from '@tanstack/react-query';

        import { QueryKeys } from 'shared/constants/query-keys';

        import { get${singular.pascal}, get${plural.pascal} } from '../api/get';
        import { IGet${plural.pascal}Params } from '../types/params';

        // One options factory per query, shared by the server prefetch in app/ and the hook, so
        // the query key and the fetcher cannot drift apart.
        export const ${plural.camel}QueryOptions = (query: IGet${plural.pascal}Params) =>
            queryOptions({
                queryKey: [QueryKeys.GET_${plural.constant}, query],
                queryFn: ({ signal }) => get${plural.pascal}(query, signal),
            });

        export const ${singular.camel}QueryOptions = (${singular.camel}Id: string) =>
            queryOptions({
                queryKey: [QueryKeys.GET_${plural.constant}, ${singular.camel}Id],
                queryFn: ({ signal }) => get${singular.pascal}(${singular.camel}Id, signal),
            });

        export const useGet${plural.pascal} = (query: IGet${plural.pascal}Params) =>
            useQuery(${plural.camel}QueryOptions(query));

        export const useGet${plural.pascal}InfiniteScroll = (query: IGet${plural.pascal}Params) => {
            return useInfiniteQuery({
                initialPageParam: 1,
                queryKey: [QueryKeys.GET_INFINITE_${plural.constant}, query],
                queryFn: ({ pageParam, signal }) => get${plural.pascal}({ ...query, page: pageParam }, signal),
                getNextPageParam: lastPage => lastPage.data.nextPage,
            });
        };

        export const useGet${singular.pascal} = (${singular.camel}Id: string) =>
            useQuery(${singular.camel}QueryOptions(${singular.camel}Id));
    `.trim(),

  'hooks/put': ({ singular, plural }) =>
    `
        import { useMutation, useQueryClient } from '@tanstack/react-query';
        import { IUpdate${singular.pascal} } from "../types/payloads"
        import { QueryKeys } from 'shared/constants/query-keys';

        import { update${singular.pascal} } from '../api/put';

        export const useUpdate${singular.pascal} = () => {
            const queryClient = useQueryClient();

            return useMutation({
                onSuccess() {
                    return Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: [QueryKeys.GET_${plural.constant}],
                        }),
                        queryClient.invalidateQueries({
                            queryKey: [QueryKeys.GET_INFINITE_${plural.constant}],
                        }),
                    ]);
                },
                mutationFn: ({${singular.camel}Id, ...payload}: IUpdate${singular.pascal} & {
                    ${singular.camel}Id: string;
                }) => update${singular.pascal}(${singular.camel}Id, payload),
            });
        };
    `.trim(),

  'hooks/patch': ({ singular, plural }) =>
    `
        import { useMutation, useQueryClient } from '@tanstack/react-query';

        import { QueryKeys } from 'shared/constants/query-keys';

        import { toggle${singular.pascal} } from '../api/patch';

        export const useToggle${singular.pascal} = () => {
            const queryClient = useQueryClient();

            return useMutation({
                onSuccess() {
                    return Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: [QueryKeys.GET_${plural.constant}],
                        }),
                        queryClient.invalidateQueries({
                            queryKey: [QueryKeys.GET_INFINITE_${plural.constant}],
                        }),
                    ]);
                },
                mutationFn: (${singular.camel}Id: string) => toggle${singular.pascal}(${singular.camel}Id),
            });
        };
    `.trim(),

  'hooks/post': ({ singular, plural }) =>
    `
        import { useMutation, useQueryClient } from '@tanstack/react-query';
        import { ICreate${singular.pascal} } from "../types/payloads"
        import { QueryKeys } from 'shared/constants/query-keys';

        import { create${singular.pascal} } from '../api/post';

        export const useCreate${singular.pascal} = () => {
            const queryClient = useQueryClient();

            return useMutation({
                onSuccess() {
                    return Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: [QueryKeys.GET_${plural.constant}],
                        }),
                        queryClient.invalidateQueries({
                            queryKey: [QueryKeys.GET_INFINITE_${plural.constant}],
                        }),
                    ]);
                },
                mutationFn: (payload: ICreate${singular.pascal}) => create${singular.pascal}(payload),
            });
        };
    `.trim(),

  'hooks/delete': ({ singular, plural }) =>
    `
        import { useMutation, useQueryClient } from '@tanstack/react-query';

        import { QueryKeys } from 'shared/constants/query-keys';

        import { delete${singular.pascal} } from '../api/delete';

        export const useDelete${singular.pascal} = () => {
            const queryClient = useQueryClient();

            return useMutation({
                onSuccess() {
                    return Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: [QueryKeys.GET_${plural.constant}],
                        }),
                        queryClient.invalidateQueries({
                            queryKey: [QueryKeys.GET_INFINITE_${plural.constant}],
                        }),
                    ]);
                },
                mutationFn: (${singular.camel}Id: string) => delete${singular.pascal}(${singular.camel}Id),
            });
        };
    `.trim(),

  'api/get': ({ singular, plural }) =>
    `
        import { api } from 'shared/lib/axios';
        import { I${singular.pascal}Response, I${plural.pascal}Response } from '../types/responses';
        import { IGet${plural.pascal}Params } from '../types/params';

        export const get${singular.pascal} = async (
            ${singular.camel}Id: string,
            signal?: AbortSignal,
        ): Promise<I${singular.pascal}Response> => {
            const response = await api.get<I${singular.pascal}Response>(\`/${plural.kebab}/\${${singular.camel}Id}\`, {
                signal,
            });

            return response.data;
        };

        export const get${plural.pascal} = async (
            params: IGet${plural.pascal}Params,
            signal?: AbortSignal,
        ): Promise<I${plural.pascal}Response> => {
            const response = await api.get<I${plural.pascal}Response>("/${plural.kebab}", {
                signal,
                params,
            });

            return response.data;
        };
    `.trim(),

  'api/put': ({ singular, plural }) =>
    `
        import { api } from 'shared/lib/axios';
        import { I${singular.pascal}Response } from '../types/responses';
        import { IUpdate${singular.pascal} } from '../types/payloads';

        export const update${singular.pascal} = async (
            ${singular.camel}Id: string,
            payload: IUpdate${singular.pascal}
        ): Promise<I${singular.pascal}Response> => {
            const response = await api.put<I${singular.pascal}Response>(\`/${plural.kebab}/\${${singular.camel}Id}\`, payload);

            return response.data;
        };
    `.trim(),

  'api/patch': ({ singular, plural }) =>
    `
        import { api } from 'shared/lib/axios';
        import { I${singular.pascal}Response } from '../types/responses';

        export const toggle${singular.pascal} = async (
            ${singular.camel}Id: string,
        ): Promise<I${singular.pascal}Response> => {
            const response = await api.patch<I${singular.pascal}Response>(\`/${plural.kebab}/\${${singular.camel}Id}\`);

            return response.data;
        };
    `.trim(),

  'api/post': ({ singular, plural }) =>
    `
        import { api } from 'shared/lib/axios';
        import { I${singular.pascal}Response } from '../types/responses';
        import { ICreate${singular.pascal} } from '../types/payloads';

        export const create${singular.pascal} = async (
            payload: ICreate${singular.pascal}
        ): Promise<I${singular.pascal}Response> => {
            const response = await api.post<I${singular.pascal}Response>("/${plural.kebab}", payload);

            return response.data;
        };
    `.trim(),

  'api/delete': ({ singular, plural }) =>
    `
        import { api } from 'shared/lib/axios';
        import { I${singular.pascal}Response } from '../types/responses';

        export const delete${singular.pascal} = async (
            ${singular.camel}Id: string,
        ): Promise<I${singular.pascal}Response> => {
            const response = await api.delete<I${singular.pascal}Response>(\`/${plural.kebab}/\${${singular.camel}Id}\`);

            return response.data;
        };
    `.trim(),

  'types/params': ({ plural }) =>
    `
        export interface IGet${plural.pascal}Params {
            page: number;
            perPage: number;
        }
    `.trim(),

  'types/payloads': ({ singular }) =>
    `
        import { I${singular.pascal} } from "./responses"

        export interface ICreate${singular.pascal} extends Required<Omit<I${singular.pascal}, "id">> {}
        export interface IUpdate${singular.pascal} extends Partial<Omit<I${singular.pascal}, "id">> {}
    `.trim(),

  'types/responses': ({ singular, plural }) =>
    `
        export interface I${singular.pascal} {
            id: string;
            fullName: string;
        }

        export interface I${singular.pascal}Response {
            message: string;
            data: I${singular.pascal}
        }

        export interface I${plural.pascal}Response {
            message: string;
            data: {
                totalPages: number;
                perPage: number;
                total: number
                nextPage: number | null;
                prevPage: number | null;
                ${plural.camel}: I${singular.pascal}[]
            }
        }
    `.trim(),
};

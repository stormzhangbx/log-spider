import { request } from '@umijs/max'
import type { CreateDictDataParams, DictDataModel, ListDictDataParams, UpdateDictDataParams } from './model'
import { RequestEnum } from '@/enums/httpEnum'

export * from './model'

/**
 * 查询字典数据列表
 */
export function listDictData(params: ListDictDataParams) {
  return request<Pagination<DictDataModel>>('/dict/data/list', {
    method: RequestEnum.GET,
    params,
  })
}

/**
 * 添加字典数据
 */
export function addDictData(params: CreateDictDataParams) {
  return request('/dict/data/add', {
    method: RequestEnum.POST,
    data: params,
  })
}

/**
 * 更新字典数据
 */
export function updateDictData(params: UpdateDictDataParams) {
  return request('/dict/data/update', {
    method: RequestEnum.PUT,
    data: params,
  })
}

/**
 * 删除字典数据
 */
export function deleteDictData(postIds: React.Key) {
  return request(`/dict/data/delete/${postIds}`, {
    method: RequestEnum.DELETE,
  })
}

/**
 * 查询字典数据详情
 */
export function infoDictData(postId: React.Key) {
  return request<DictDataModel>(`/dict/data/info/${postId}`, {
    method: RequestEnum.GET,
  })
}

/**
 * 根据字典类型查询字典数据列表
 */
export function optionDictData(type: string) {
  return request<DictDataModel[]>(`/dict/data/option/${type}`, {
    method: RequestEnum.GET,
  })
}
